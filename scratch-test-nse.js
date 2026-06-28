const { NseIndia } = require('stock-nse-india');
const nse = new NseIndia();

async function run() {
  try {
    console.log('Testing stock-nse-india with CARRARO...');
    const details = await nse.getEquityDetails('CARRARO');
    console.log('PriceInfo:', details.priceInfo);
    console.log('Metadata:', details.metadata);
  } catch (err) {
    console.error('NSE fetch error:', err.message);
  }
}

run();
