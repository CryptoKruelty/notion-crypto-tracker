const axios = require('axios');
const routes = require('express').Router();
const cron = require('node-cron');

const cmcRouter = require('./cmc.js');
const bscScanRouter = require('./bscScan.js');
const notionRouter = require('./notion.js');

const { KYOTOPROTOCOL_CONTRACT } = require('../contracts.js');

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
    console.log('Phase 1: CMC data retrieved');
    const { name, price } = cmcData;
    const { data: bscScanData } = await axios.get(
      api + `/bscScan/${contract}/${walleltAddress}`
    );
    console.log('Phase 2: BSC Scan data retrieved');
    const { amountOfToken } = bscScanData;
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
  }
};

start();
cron.schedule('*/30 * * * *', () => start());

module.exports = routes;
