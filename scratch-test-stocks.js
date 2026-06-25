async function testStocks() {
  try {
    console.log('Fetching stocks from API...');
    const res = await fetch('http://localhost:3000/api/stocks?limit=50');
    console.log('Response Status:', res.status);
    const contentType = res.headers.get('content-type');
    console.log('Content-Type:', contentType);
    const text = await res.text();
    console.log('Snippet of response:');
    console.log(text.substring(0, 500));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
testStocks();
