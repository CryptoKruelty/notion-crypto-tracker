require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');

if (process.env.NODE_ENV === 'production') {
  api = process.env.API_URL;
  cmcKey = process.env.CMC_API_KEY;
  url = 'https://pro-api.coinmarketcap.com';
} else {
  api = process.env.LOCALHOST_URL;
  cmcKey = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c';
  url = 'https://sandbox-api.coinmarketcap.com';
}

// Search token by CMC slug, converting into desired currency
router.get(`/:slug/:currency`, async (req, res) => {
  const { slug, currency } = req.params;
  try {
    const { data } = await axios.get(
      `${url}/v2/cryptocurrency/quotes/latest?slug=${slug}&convert=${currency}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': cmcKey
        }
      }
    );
    const { name, quote } = data.data[slug]; // We may add more properties, but these are the ones I need to be minimal
    const { price } = quote[currency];
    console.log({ name, price });
    return res.json({ name, price });
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
