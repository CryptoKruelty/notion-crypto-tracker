require('dotenv').config();
const cheerio = require('cheerio');
const FormData = require('form-data');
const router = require('express').Router();
const axios = require('axios');

router.get(`/:address`, async (req, res) => {
  const { address } = req.params;
  const formData = new FormData();
  formData.append('address', address);
  formData.append('submit', 'Search');

  try {
    const { data } = await axios.post(
      'https://v2.kyoto-dev.com/index.php',
      formData,
      { headers: formData.getHeaders() }
    );

    const $ = cheerio.load(data);

    console.log($('.message').eq(1).text());

    const total = Number($('.message').eq(1).text().replace(/^\D+/g, ''));
    console.log(total);
    return res.json({ amountOfToken: total });
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
