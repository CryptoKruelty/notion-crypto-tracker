require('dotenv').config();
const FormData = require('form-data');
const jsdom = require('jsdom');
const router = require('express').Router();
const axios = require('axios');

const { JSDOM } = jsdom;

// Get BEP-20 Token Account Balance by ContractAddress
router.get(`/:address`, async (req, res) => {
  const { address } = req.params;
  const formData = new FormData();
  formData.append('address', address);
  formData.append('submit', 'Search');

  try {
    const { data } = await axios.post('https://v2.kyoto-dev.com/index.php', {
      headers: { 'Content-Type': 'multipart/form-data' },
      data: {
        formData
      }
    });
    const pageHTML = new JSDOM(data);
    const total = Number(
      pageHTML.getElementsByClassName('message')[1].replace(/^\D+/g, '')
    );
    return res.json({ amountOfToken: total });
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
