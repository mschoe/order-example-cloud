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
    taskType: 'charge-account',
    taskHandler: (job, _, worker) => {
      const { orderId } = job.variables
      worker.log('charge account for order ' + orderId);
      const payload = {'transactionId' : 'tns-$$' + Math.floor(Math.random() * 999)}
      job.complete(payload);
    }
  });

  zbc.createWorker({
    taskType: 'confirm-payment',
    taskHandler: (job, _, worker) => {
      const { orderId } = job.variables;
      const { transactionId } = job.variables;
      const paymentSuccessfull = Math.random() < 0.7;
      
      zbc.publishMessage({    
        correlationKey: orderId,    
        name: "payment_confirm_msg",
        variables: {'paymentSuccessfull' : paymentSuccessfull,
                    'transactionId' : transactionId},
        timeToLive: 600000
      });
      job.complete();
    }    
  });
  
})()