import axios from 'axios'

const YAHOO_SYMBOLS_MAP: Record<string, string> = {
  'SBI': 'SBIN.NS',
  'L&T': 'LT.NS',
}

// List of top Indian stock symbols with realistic base prices and names
const BASE_STOCKS = [
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

async function fetchYahooChartQuote(symbol: string) {
  try {
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 2000,
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
    // Silent fail to prevent logs flooding
  }
  return null
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
    const promises = BASE_STOCKS.map(async (stock) => {
      const yahooSymbol = YAHOO_SYMBOLS_MAP[stock.symbol] || `${stock.symbol}.NS`
      const data = await fetchYahooChartQuote(yahooSymbol)
      if (data) {
        return {
          symbol: stock.symbol,
          name: stock.name,
          ltP: data.price,
          open: data.open,
          high: data.high,
          low: data.low,
          pCh: data.change,
          pChg: data.pChg,
          volume: data.volume,
          marketCap: Math.floor(data.price * stock.volume * 10),
        }
      }
      return null
    })

    const results = await Promise.all(promises)
    const valid = results.filter(Boolean) as any[]
    if (valid.length > 0) {
      cachedQuotes = valid
      lastStocksFetch = now
      return cachedQuotes
    }
  } catch (error) {
    // Fall back to simulation
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
    
    // Only drift prices if the market is open
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

const INDICES_MAP = [
  { symbol: '^NSEI', name: 'NIFTY 50', key: '^NSEI' },
  { symbol: '^BSESN', name: 'SENSEX', key: '^BSESN' },
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
