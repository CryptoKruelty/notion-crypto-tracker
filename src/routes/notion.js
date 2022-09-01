require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');

const { Client } = require('@notionhq/client');

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const databaseId = process.env.NOTION_DATABASE;

router.post('/insert', async (req, res) => {
  const { cmcData, kyotoData } = req.body; //, bscScanData
  const { name, price } = cmcData;
  // const { amountOfToken } = bscScanData;
  const { amountOfToken } = kyotoData;
  // const bagValue = amountOfToken * price;
  const bagValue = amountOfToken * 0.330753316;
  try {
    // if there's not database page name, create a new one
    const page = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Token Name',
        rich_text: {
          equals: name
        }
      }
    });
    if (page.results.length === 0) {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'Token Name': {
            title: [
              {
                text: {
                  content: name
                }
              }
            ]
          },
          'Current Price': {
            number: price
          },
          'Price at L1 Launch': {
            number: 0.330753316
          },
          'Amount of Token': {
            number: amountOfToken
          },
          'Bag Value': {
            number: bagValue
          }
        }
      });
      return res.json('Success! Entry added.');
    }
    // if there's already a database page name, update the existing one
    const pageId = page.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Current Price': {
          number: price
        },
        'Price at L1 Launch': {
          number: 0.330753316
        },
        'Amount of Token': {
          number: amountOfToken
        },
        'Bag Value': {
          number: bagValue
        }
      }
    });
    return res.json('Entry already exists. Updated!');
  } catch (error) {
    return res.send(error);
  }
});

module.exports = router;
