const axiosRetry = require('axios-retry');
const axios = require('axios');
const routes = require('express').Router();
const cron = require('node-cron');

const cmcRouter = require('./cmc.js');
const bscScanRouter = require('./bscScan.js');
const notionRouter = require('./notion.js');

const { KYOTOPROTOCOL_CONTRACT } = require('../contracts.js');

axiosRetry(axios, { retries: 3 });

routes.use('/cmc', cmcRouter);
routes.use('/bscScan', bscScanRouter);
routes.use('/notion', notionRouter);

let api;

if (process.env.NODE_ENV === 'production') {
  api = process.env.API_URL;
} else {
  api = process.env.LOCALHOST_URL;
}

const currency = 'EUR';
const { slug, contract, decimals } = KYOTOPROTOCOL_CONTRACT;
const walleltAddress = process.env.BSC_WALLET;

const start = async () => {
  console.log('Script started!');
  try {
    const { data: cmcData } = await axios.get(api + `/cmc/${slug}/${currency}`);
    const { name, price } = cmcData;
    console.log(`Phase 1: CMC data processed: ${name} - ${price}`);
    const { data: bscScanData } = await axios.get(
      api + `/bscScan/${contract}/${walleltAddress}`
    );
    const { amountOfToken } = bscScanData;
    console.log(`Phase 2: BSCScan data processed: ${amountOfToken}`);
    const { data: notionData } = await axios.post(api + '/notion/insert', {
      cmcData: {
        name,
        price,
        last_updated: Date.now()
      },
      bscScanData: {
        amountOfToken: amountOfToken / Math.pow(10, decimals) // Notion doens't have float precision, so even thought Javascript is not good with it, neither is Notion.
      }
    });
    console.log(notionData);
  } catch (error) {
    console.log(error);
    return errorHandler();
  }
};

start();
cron.schedule('*/30 * * * *', () => start());

module.exports = routes;
