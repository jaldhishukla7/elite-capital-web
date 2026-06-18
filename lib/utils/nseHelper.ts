import axios from 'axios'

export const YAHOO_SYMBOLS_MAP: Record<string, string> = {
  'SBI': 'SBIN.NS',
  'L&T': 'LT.NS',
  'M&M': 'M%26M.NS',
  'NIFTY50': '^NSEI',
  'SENSEX': '^BSESN',
  'NIFTYBANK': '^NSEBANK',
  'NIFTYJUNIOR': 'NIFTYBEES.NS',
  'NIFTYMIDCAP150': '^NSEMD150',
  'NIFTY500': '^NSEI500',
  '^NSEI': '^NSEI',
  '^BSESN': '^BSESN',
  '^NSEBANK': '^NSEBANK',
  '^NSEMD150': '^NSEMD150',
  '^NSEI500': '^NSEI500',
}

// List of top Indian stock symbols with realistic base prices and names
export const BASE_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', price: 2945.30, open: 2920.00, change: 25.30, pChg: 0.87, volume: 5400000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', price: 3820.15, open: 3850.00, change: -29.85, pChg: -0.78, volume: 2100000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1612.45, open: 1598.00, change: 14.45, pChg: 0.90, volume: 8900000 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1485.60, open: 1472.00, change: 13.60, pChg: 0.92, volume: 4300000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 1124.80, open: 1118.00, change: 6.80, pChg: 0.61, volume: 6500000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 1380.25, open: 1365.00, change: 15.25, pChg: 1.12, volume: 3200000 },
  { symbol: 'SBI', name: 'State Bank of India', price: 832.90, open: 825.00, change: 7.90, pChg: 0.96, volume: 11200000 },
  { symbol: 'LICHSGFIN', name: 'LIC Housing Finance Limited', price: 742.15, open: 745.00, change: -2.85, pChg: -0.38, volume: 1500000 },
  { symbol: 'L&T', name: 'Larsen & Toubro Limited', price: 3560.40, open: 3530.00, change: 30.40, pChg: 0.86, volume: 1800000 },
  { symbol: 'ITC', name: 'ITC Limited', price: 432.75, open: 435.50, change: -2.75, pChg: -0.63, volume: 12400000 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', price: 2485.30, open: 2510.00, change: -24.70, pChg: -0.98, volume: 2200000 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', price: 1735.90, open: 1720.00, change: 15.90, pChg: 0.92, volume: 2800000 },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', price: 1182.10, open: 1175.00, change: 7.10, pChg: 0.60, volume: 4900000 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', price: 2912.40, open: 2940.00, change: -27.60, pChg: -0.94, volume: 1100000 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', price: 12150.00, open: 12050.00, change: 100.00, pChg: 0.83, volume: 600000 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: 980.50, open: 975.00, change: 5.00, pChg: 0.51, volume: 7200000 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', price: 167.30, open: 168.10, change: -0.80, pChg: -0.48, volume: 14500000 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', price: 6850.00, open: 6800.00, change: 50.00, pChg: 0.74, volume: 1300000 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited', price: 1580.40, open: 1565.00, change: 15.40, pChg: 0.98, volume: 1900000 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Limited', price: 1420.50, open: 1425.00, change: -4.50, pChg: -0.32, volume: 2400000 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', price: 1540.20, open: 1520.00, change: 20.20, pChg: 1.33, volume: 1800000 },
  { symbol: 'NTPC', name: 'NTPC Limited', price: 360.40, open: 358.00, change: 2.40, pChg: 0.67, volume: 8200000 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Limited', price: 298.15, open: 295.00, change: 3.15, pChg: 1.07, volume: 6800000 },
  { symbol: 'TITAN', name: 'Titan Company Limited', price: 3420.00, open: 3450.00, change: -30.00, pChg: -0.87, volume: 900000 },
  { symbol: 'COALINDIA', name: 'Coal India Limited', price: 475.20, open: 470.00, change: 5.20, pChg: 1.11, volume: 5900000 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', price: 3120.40, open: 3080.00, change: 40.40, pChg: 1.31, volume: 2200000 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Limited', price: 1350.60, open: 1340.00, change: 10.60, pChg: 0.79, volume: 3100000 },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: 485.30, open: 490.00, change: -4.70, pChg: -0.96, volume: 4100000 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', price: 9850.00, open: 9800.00, change: 50.00, pChg: 0.51, volume: 400000 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', price: 890.40, open: 885.00, change: 5.40, pChg: 0.61, volume: 2100000 },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Limited', price: 270.80, open: 268.00, change: 2.80, pChg: 1.04, volume: 9800000 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', price: 2450.25, open: 2420.00, change: 30.25, pChg: 1.25, volume: 3400000 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Limited', price: 1115.40, open: 1120.00, change: -4.60, pChg: -0.41, volume: 1500000 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Limited', price: 615.30, open: 610.00, change: 5.30, pChg: 0.87, volume: 4800000 },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', price: 2510.45, open: 2530.00, change: -19.55, pChg: -0.77, volume: 600000 },
  { symbol: 'CIPLA', name: 'Cipla Limited', price: 1490.50, open: 1475.00, change: 15.00, pChg: 1.02, volume: 1600000 },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', price: 1320.40, open: 1315.00, change: 5.40, pChg: 0.41, volume: 1800000 },
  { symbol: 'GRASIM', name: 'Grasim Industries Limited', price: 2320.10, open: 2335.00, change: -14.90, pChg: -0.64, volume: 900000 },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Limited', price: 1460.50, open: 1450.00, change: 10.50, pChg: 0.72, volume: 1100000 },
  { symbol: 'ZOMATO', name: 'Zomato Limited', price: 185.20, open: 182.00, change: 3.20, pChg: 1.76, volume: 24000000 },
  { symbol: 'PAYTM', name: 'One 97 Communications Limited (Paytm)', price: 410.50, open: 420.00, change: -9.50, pChg: -2.26, volume: 5200000 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Limited', price: 4250.00, open: 4190.00, change: 60.00, pChg: 1.43, volume: 2200000 },
  { symbol: 'BEL', name: 'Bharat Electronics Limited', price: 285.40, open: 280.00, change: 5.40, pChg: 1.93, volume: 12500000 },
]

interface StockState {
  price: number
  change: number
  pChg: number
  volume: number
  high: number
  low: number
}

const stockCache: Record<string, StockState> = {}

export function isMarketOpenIST() {
  const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const now = new Date(istDateString)
  
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
  const hours = now.getHours()
  const minutes = now.getMinutes()

  if (dayOfWeek === 0 || dayOfWeek === 6) return false

  const timeInMinutes = hours * 60 + minutes
  const marketOpen = 9 * 60 + 15 // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM

  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose
}

export async function fetchYahooChartQuote(symbol: string) {
  try {
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 3000,
    })
    const meta = res.data?.chart?.result?.[0]?.meta
    if (meta) {
      const price = meta.regularMarketPrice || meta.chartPreviousClose || 0
      const prevClose = meta.chartPreviousClose || price
      const change = price - prevClose
      const pChg = prevClose > 0 ? (change / prevClose) * 100 : 0
      return {
        price,
        open: prevClose,
        high: meta.dayHigh || price,
        low: meta.dayLow || price,
        change,
        pChg,
        volume: meta.regularMarketVolume || 0,
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null
}

// Batch quote fetching for better performance
async function fetchYahooQuotesBatch(symbols: string[]) {
  try {
    const mapped = symbols.map(s => YAHOO_SYMBOLS_MAP[s] || (s.includes('^') || s.endsWith('.NS') ? s : `${s}.NS`))
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${mapped.join(',')}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 4000,
    })
    const quotes = res.data?.quoteResponse?.result || []
    return quotes
  } catch (error) {
    console.error('Error fetching batch Yahoo quotes:', error)
    return []
  }
}

let lastStocksFetch = 0
let cachedQuotes: any[] = []

export async function getAllQuotes() {
  const now = Date.now()
  // Cache quotes for 8 seconds to prevent rate limits
  if (now - lastStocksFetch < 8000 && cachedQuotes.length > 0) {
    return cachedQuotes
  }

  try {
    const symbols = BASE_STOCKS.map(s => s.symbol)
    const yahooQuotes = await fetchYahooQuotesBatch(symbols)
    
    if (yahooQuotes && yahooQuotes.length > 0) {
      const results = BASE_STOCKS.map((stock) => {
        const yahooSymbol = YAHOO_SYMBOLS_MAP[stock.symbol] || `${stock.symbol}.NS`
        const data = yahooQuotes.find((q: any) => q.symbol?.toUpperCase() === yahooSymbol.toUpperCase())
        
        if (data) {
          const price = data.regularMarketPrice || stock.price
          const prevClose = data.regularMarketPreviousClose || price
          const change = data.regularMarketChange ?? (price - prevClose)
          const pChg = data.regularMarketChangePercent ?? (prevClose > 0 ? (change / prevClose) * 100 : 0)
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            ltP: parseFloat(price.toFixed(2)),
            open: parseFloat((data.regularMarketOpen || prevClose).toFixed(2)),
            high: parseFloat((data.regularMarketDayHigh || price).toFixed(2)),
            low: parseFloat((data.regularMarketDayLow || price).toFixed(2)),
            pCh: parseFloat(change.toFixed(2)),
            pChg: parseFloat(pChg.toFixed(2)),
            volume: data.regularMarketVolume || stock.volume,
            marketCap: data.marketCap || Math.floor(price * stock.volume * 10),
          }
        }
        return null
      }).filter(Boolean)

      if (results.length > 0) {
        cachedQuotes = results
        lastStocksFetch = now
        return cachedQuotes
      }
    }
  } catch (error) {
    // Fall back to simulation below
  }

  // Fallback stateful stock quotes generator (smooth drift random walk during live market)
  const isLive = isMarketOpenIST()
  return BASE_STOCKS.map((stock) => {
    if (!stockCache[stock.symbol]) {
      stockCache[stock.symbol] = {
        price: stock.price,
        change: stock.change,
        pChg: stock.pChg,
        volume: stock.volume,
        high: stock.price * 1.01,
        low: stock.price * 0.99,
      }
    }

    const cached = stockCache[stock.symbol]
    
    let newPrice = cached.price
    let change = cached.change
    let pChg = cached.pChg
    let volume = cached.volume

    if (isLive) {
      const driftPercent = (Math.random() * 0.001 - 0.0005)
      const priceDiff = cached.price * driftPercent
      newPrice = cached.price + priceDiff
      
      const minPrice = stock.price * 0.97
      const maxPrice = stock.price * 1.03
      newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice))

      change = newPrice - stock.open
      pChg = (change / stock.open) * 100
      
      const volumeChange = Math.floor((Math.random() - 0.3) * 5000)
      volume = Math.max(10000, cached.volume + volumeChange)

      stockCache[stock.symbol] = {
        price: newPrice,
        change,
        pChg,
        volume,
        high: Math.max(cached.high, newPrice),
        low: Math.min(cached.low, newPrice),
      }
    }

    return {
      symbol: stock.symbol,
      name: stock.name,
      ltP: parseFloat(newPrice.toFixed(2)),
      open: stock.open,
      high: parseFloat(stockCache[stock.symbol].high.toFixed(2)),
      low: parseFloat(stockCache[stock.symbol].low.toFixed(2)),
      pCh: parseFloat(change.toFixed(2)),
      pChg: parseFloat(pChg.toFixed(2)),
      volume: volume,
      marketCap: Math.floor(stock.price * stock.volume * 10),
    }
  })
}

export async function getSingleQuote(symbol: string) {
  const upperSymbol = symbol.toUpperCase()
  const baseStock = BASE_STOCKS.find(s => s.symbol === upperSymbol)
  const name = baseStock ? baseStock.name : `${upperSymbol} Limited`
  
  // Use mapping or defaults
  const yahooSymbol = YAHOO_SYMBOLS_MAP[upperSymbol] || (upperSymbol.includes('^') || upperSymbol.endsWith('.NS') ? upperSymbol : `${upperSymbol}.NS`)
  
  try {
    const data = await fetchYahooChartQuote(yahooSymbol)
    if (data) {
      return {
        symbol: upperSymbol,
        name,
        ltP: parseFloat(data.price.toFixed(2)),
        open: parseFloat(data.open.toFixed(2)),
        high: parseFloat(data.high.toFixed(2)),
        low: parseFloat(data.low.toFixed(2)),
        pCh: parseFloat(data.change.toFixed(2)),
        pChg: parseFloat(data.pChg.toFixed(2)),
        volume: data.volume,
        marketCap: Math.floor(data.price * (baseStock?.volume || 5000000) * 10),
      }
    }
  } catch (error) {
    console.error('Error fetching single quote from Yahoo:', error)
  }

  // Fallback to cached default quote if available, or generate a simulated one
  if (baseStock) {
    const all = await getAllQuotes()
    const found = all.find((s: any) => s.symbol === upperSymbol)
    if (found) return found
  }

  // General fallback
  const mockPrice = baseStock ? baseStock.price : 500
  return {
    symbol: upperSymbol,
    name,
    ltP: mockPrice,
    open: mockPrice * 0.99,
    high: mockPrice * 1.01,
    low: mockPrice * 0.985,
    pCh: mockPrice * 0.01,
    pChg: 1.0,
    volume: 1500000,
    marketCap: mockPrice * 50000000,
  }
}

export async function getYahooChartHistory(symbol: string, range: string = '1mo', interval: string = '1d') {
  const upperSymbol = symbol.toUpperCase()
  const yahooSymbol = YAHOO_SYMBOLS_MAP[upperSymbol] || (upperSymbol.includes('^') || upperSymbol.endsWith('.NS') ? upperSymbol : `${upperSymbol}.NS`)
  
  try {
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 3000,
    })
    
    const result = res.data?.chart?.result?.[0]
    if (result) {
      const timestamps = result.timestamp || []
      const closePrices = result.indicators?.quote?.[0]?.close || []
      
      const history = timestamps.map((time: number, idx: number) => ({
        date: new Date(time * 1000).toISOString(),
        price: closePrices[idx] !== null && closePrices[idx] !== undefined ? parseFloat(closePrices[idx].toFixed(2)) : null
      })).filter((item: any) => item.price !== null)

      if (history.length > 0) {
        return history
      }
    }
  } catch (error) {
    console.error(`Error fetching Yahoo history for ${yahooSymbol}:`, error)
  }

  // Return simulated history as a fallback
  const baseStock = BASE_STOCKS.find(s => s.symbol === upperSymbol)
  const basePrice = baseStock ? baseStock.price : 1000
  const history = []
  
  // Decide how many data points to return
  let points = 22 // 1 month default
  if (range === '1d') points = 24
  else if (range === '5d') points = 5
  else if (range === '6mo') points = 120
  else if (range === '1y') points = 250

  let current = basePrice
  const timeStep = range === '1d' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * timeStep)
    current = current * (1 + (Math.random() * 0.03 - 0.014)) // general slight upward bias
    history.push({
      date: date.toISOString(),
      price: parseFloat(current.toFixed(2))
    })
  }
  return history
}

const INDICES_MAP = [
  { symbol: '^NSEI', name: 'NIFTY 50', key: '^NSEI' },
  { symbol: '^BSESN', name: 'SENSEX', key: '^BSESN' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK', key: '^NSEBANK' },
  { symbol: 'NIFTYBEES.NS', name: 'NIFTY JR 50', key: 'NIFTYJUNIOR' }, // Use ETF proxy for reliable chart indices
  { symbol: '^NSEMD150', name: 'NIFTY MIDCAP 150', key: 'NIFTYMIDCAP150' },
  { symbol: '^NSEI500', name: 'NIFTY 500', key: 'NIFTY500' },
]

let lastIndicesFetch = 0
let cachedIndices: any[] = []

export async function getYahooIndices() {
  const now = Date.now()
  if (now - lastIndicesFetch < 8000 && cachedIndices.length > 0) {
    return cachedIndices
  }

  try {
    const promises = INDICES_MAP.map(async (ind) => {
      const data = await fetchYahooChartQuote(ind.symbol)
      if (data) {
        // Adjust Nifty BeES price back to Index level (x100 approx)
        const price = ind.key === 'NIFTYJUNIOR' ? data.price * 100 : data.price
        const open = ind.key === 'NIFTYJUNIOR' ? data.open * 100 : data.open
        const high = ind.key === 'NIFTYJUNIOR' ? data.high * 100 : data.high
        const low = ind.key === 'NIFTYJUNIOR' ? data.low * 100 : data.low
        const change = price - open

        return {
          symbol: ind.key,
          name: ind.name,
          type: 'index',
          ltP: price,
          open: open,
          high: high,
          low: low,
          pCh: change,
          pChg: data.pChg,
        }
      }
      return null
    })

    const results = await Promise.all(promises)
    const valid = results.filter(Boolean) as any[]
    if (valid.length > 0) {
      cachedIndices = valid
      lastIndicesFetch = now
      return cachedIndices
    }
  } catch (e) {
    // Fallback
  }
  return null
}

const COMMODITIES_MAP = [
  { symbol: 'GC=F', name: 'Gold (Per Gram)', scale: (price: number) => (price / 31.1035) * 83.50 * 1.15, key: 'GOLD', unit: '₹' },
  { symbol: 'SI=F', name: 'Silver (Per Kg)', scale: (price: number) => price * 32.1507 * 83.50 * 1.12, key: 'SILVER', unit: '₹' },
  { symbol: 'CL=F', name: 'Crude Oil (Per Barrel)', scale: (price: number) => price * 83.50, key: 'CRUDE', unit: '₹' },
]

let lastCommFetch = 0
let cachedCommodities: any[] = []

export async function getYahooCommodities() {
  const now = Date.now()
  if (now - lastCommFetch < 8000 && cachedCommodities.length > 0) {
    return cachedCommodities
  }

  try {
    const promises = COMMODITIES_MAP.map(async (comm) => {
      const data = await fetchYahooChartQuote(comm.symbol)
      if (data) {
        const scaledPrice = comm.scale(data.price)
        const scaledOpen = comm.scale(data.open)
        const change = scaledPrice - scaledOpen
        const pChg = scaledOpen > 0 ? (change / scaledOpen) * 100 : 0
        return {
          symbol: comm.key,
          name: comm.name,
          unit: comm.unit,
          price: scaledPrice,
          change: change,
          changePercent: pChg,
        }
      }
      return null
    })

    const results = await Promise.all(promises)
    const valid = results.filter(Boolean) as any[]
    if (valid.length > 0) {
      cachedCommodities = valid
      lastCommFetch = now
      return cachedCommodities
    }
  } catch (e) {
    // Fallback
  }
  return null
}
