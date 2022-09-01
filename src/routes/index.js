const axios = require('axios');
const routes = require('express').Router();
const cron = require('node-cron');

const cmcRouter = require('./cmc.js');
const bscScanRouter = require('./bscScan.js');
const notionRouter = require('./notion.js');
const kyotoV2Router = require('./kyotov2');

const { KYOTOPROTOCOL_CONTRACT } = require('../contracts.js');

routes.use('/cmc', cmcRouter);
routes.use('/bscScan', bscScanRouter);
routes.use('/notion', notionRouter);
routes.use('/kyoto', kyotoV2Router);

let api;

if (process.env.NODE_ENV === 'production') {
  api = process.env.API_URL;
} else {
  api = process.env.LOCALHOST_URL;
}

const currency = 'EUR';
const { slug, contract, decimals, id } = KYOTOPROTOCOL_CONTRACT;
const walletAddress = process.env.BSC_WALLET;

const start = async () => {
  console.log('Script started!');
  try {
    const { data: cmcData } = await axios.get(
      api + `/cmc/${slug}/${currency}/${id}`
    );
    const { name, price } = cmcData;
    console.log(`Phase 1: CMC data processed: ${name} - ${price}`);
    // const { data: bscScanData } = await axios.get(
    //   api + `/bscScan/${contract}/${walleltAddress}`
    // );
    const { data: kyotoData } = await axios.get(
      api + `/kyoto/${walletAddress}`
    );
    const { amountOfToken } = kyotoData;
    console.log(`Phase 2: BSCScan data processed: ${amountOfToken}`);
    const { data: notionData } = await axios.post(api + '/notion/insert', {
      cmcData: {
        name,
        price,
        last_updated: Date.now()
      },
      // bscScanData: {
      //   amountOfToken: amountOfToken / Math.pow(10, decimals) // Notion doens't have float precision, so even thought Javascript is not good with it, neither is Notion.
      // }
      kyotoData: {
        amountOfToken
      }
    });
    return console.log(notionData);
  } catch (error) {
    return console.log(error);
  }
};

start();
cron.schedule('*/10 * * * *', () => start());

module.exports = routes;
