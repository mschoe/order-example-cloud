const { ZBClient } = require('zeebe-node')
const dotenv = require("dotenv")

dotenv.config({path: './config/.env'});

void (async () => {
  const zbc = new ZBClient(process.env.ZEEBE_ADDRESS, {
    oAuth: {
      url: process.env.ZEEBE_AUTHORIZATION_SERVER_URL,
      audience: process.env.ZEEBE_AUDIENCE,
      clientId: process.env.ZEEBE_CLIENT_ID,
      clientSecret: process.env.ZEEBE_CLIENT_SECRET,
      cacheOnDisk: true
    }
	})

  zbc.createWorker({
    taskType: 'price-lookup',
    taskHandler: (job, _, worker) => {
      const { item } = job.variables;

      var itemPrice = job.customHeaders[item];

      job.complete({'itemPrice' : itemPrice});
    }
  });

  zbc.createWorker({
    taskType: 'create-invoice',
    taskHandler: (job, _, worker) => {
      const { quantity } = job.variables;
      const { itemPrice } = job.variables;

      var amount = itemPrice * quantity;

      // round price to 2 decimal places
      var m = Number((Math.abs(amount) * 100).toPrecision(15));
      amount =  Math.round(m) / 100 * Math.sign(amount);

      job.complete({'amount' : amount});
    }
  });

  zbc.createWorker({
    taskType: 'request-payment',
    taskHandler: (job, _, worker) => {
      const { orderId } = job.variables;
      const { amount } = job.variables;
      
      zbc.publishMessage({        
        name: "payment_request_msg",
        variables: {'orderId' : orderId,
                    'amount' : amount},
        timeToLive: 600000
      });

      job.complete();
    }
  });

  zbc.createWorker({
    taskType: 'ship-order',
    taskHandler: (job, _, worker) => {
      worker.log(`order shipped for ${job.variables.orderId} \n ${job.variables.quantity} ${job.variables.item}s for ${job.variables.amount}€`);      

      job.complete();
    }
  });

})()