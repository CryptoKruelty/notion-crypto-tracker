require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');

// Get BEP-20 Token Account Balance by ContractAddress
router.get(`/:contractAddress/:address`, async (req, res) => {
  const { contractAddress, address } = req.params;
  try {
    const { data } = await axios.get(
      `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${process.env.BSCSAN_API_TOKEN}`
    );
    const { result } = data;
    return res.json({ amountOfToken: result });
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
