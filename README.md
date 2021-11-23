# Order Processing in the CAmunda Cloud 
This sample application demonstrates a simple order fullfillment system running in the Camunda Cloud.

## Install Dependencies
The open source library zeebe-node provides a Zeebe client.

```
npm install --save zeebe-node
```

Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based.

```
npm install dotenv
```
## How to run it

### Cluster Setup
Spin up a cluster in the Camunda Cloud and create new [client credentials](https://docs.camunda.io/docs/components/cloud-console/manage-clusters/manage-api-clients/). Store the client credentials in the ```config/.env``` file or provide the client credentials as environment variables and use a [Zero-Conf constructor](https://github.com/camunda-community-hub/zeebe-client-node-js#zero-conf-constructor) for for the client.
For connections against the Cloud integration stage use [OAuth credentials](https://github.com/camunda-community-hub/zeebe-client-node-js#oauth). Connecting against the production stage can easily be done with the [Camunda Cloud configuration](https://github.com/camunda-community-hub/zeebe-client-node-js#camunda-cloudh) option.

### Worker Setup
1. Deploy the order and payment process and start an instance.  
```
node deploy-and-start-instance.js
```

2. Start the worker for the order process. All worker are combined in the [order-worker.js]() file.
```
node order.worker.js
```

3. start the worker for the payment process. All worker for the payment process are combined in the [payment-worker.js]() file.
```
payment-worker.js
```
