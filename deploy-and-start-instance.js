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

  const processes = ['./resources/order-process.bpmn',
  './resources/payment-process.bpmn'];
	const resultDeployment = await zbc.deployProcess(processes)
  console.log(resultDeployment)

  var dt = new Date();
  var orderId = 'order-#' + dt.valueOf();

  var order = {'orderId' : orderId,
               'amount' : 123}

	const result = await zbc.createProcessInstance('order-process', order,)

	console.log(result)
})()