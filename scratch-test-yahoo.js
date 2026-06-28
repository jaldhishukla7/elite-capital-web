const axios = require('axios');

async function testUrl(name, url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 3000,
    });
    console.log(`${name}: Success (${res.status})`);
  } catch (err) {
    console.log(`${name}: Failed (${err.message})`);
  }
}

async function run() {
  await testUrl('v6/finance/quote', 'https://query1.finance.yahoo.com/v6/finance/quote?symbols=RELIANCE.NS,TCS.NS');
  await testUrl('v10/finance/quote', 'https://query1.finance.yahoo.com/v10/finance/quote?symbols=RELIANCE.NS,TCS.NS');
  await testUrl('v11/finance/quote', 'https://query1.finance.yahoo.com/v11/finance/quote?symbols=RELIANCE.NS,TCS.NS');
}

run();
