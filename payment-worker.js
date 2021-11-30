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

  // Charge Account --> this worker charges the customers  
  // account balance. If the account balance is too low
  // the remaining amount must be charged from the credit card.
  zbc.createWorker({
    taskType: 'charge-account',
    taskHandler: (job, _, worker) => {
      var accountBalance = Math.floor(Math.random() * 150)
      const { amount } = job.variables
      var diffVal = accountBalance - amount

      const payload = {
        'newAccountBalance' : (diffVal < 0) ? 0 : diffVal,
        'outstandingBalance' : (diffVal < 0) ? Math.abs(diffVal) : 0,
        'paymentSuccessfull' : (diffVal < 0) ? false : true
      }
            
      job.complete(payload);
    }
  });

  // Charge Credit Card --> this worker charges the customers  
  // credit card. If the amount exceeds the credit cards 
  // transaction limit the payment will fail.
  zbc.createWorker({
    taskType: 'charge-creditcard',
    taskHandler: (job, _, worker) => {
      const transactionLimit = job.customHeaders['transactionLimit'];
      const { outstandingBalance } = job.variables;
      var { paymentSuccessfull } = job.variables;
      var transactionId = 'trns-$$';          

      if(transactionLimit <= outstandingBalance) {
        transactionId += Math.floor(Math.random() * 999)
        paymentSuccessfull = true;
      } else {
        transactionId += 'failed-transaction',
        paymentSuccessfull = false;
      }      
                  
      job.complete({'transactionId' : transactionId, 'paymentSuccessfull' : paymentSuccessfull});
    }
  });

  // Confirm Payment --> this worker confirms sends a message to the order process
  // The correlation key is the order Id.
  zbc.createWorker({
    taskType: 'confirm-payment',
    taskHandler: (job, _, worker) => {
      const { orderId } = job.variables;
      const { transactionId } = job.variables;
    
      worker.log(job.variables);
      zbc.publishMessage({    
        correlationKey: orderId,    
        name: "payment_confirm_msg",
        variables: {'paymentSuccessfull' : job.variables['paymentSuccessfull'],
                    'transactionId' : job.variables['transactionId']},
        timeToLive: 600000
      });
      job.complete();
    }    
  });
  
})()