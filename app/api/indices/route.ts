import { NextResponse } from 'next/server'
import { getYahooIndices } from '@/lib/utils/nseHelper'

export const revalidate = 10

const INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50', type: 'index' },
  { symbol: '^BSESN', name: 'SENSEX', type: 'index' },
  { symbol: 'NIFTYJUNIOR', name: 'NIFTY JR 50', type: 'index' },
  { symbol: 'NIFTYMIDCAP150', name: 'NIFTY MIDCAP 150', type: 'index' },
  { symbol: 'NIFTY500', name: 'NIFTY 500', type: 'index' },
]

// State cache to allow prices to update dynamically but remain stable (no sudden huge jumps)
const BASE_PRICES: Record<string, number> = {
  '^NSEI': 23487.50,
  '^BSESN': 77123.45,
  'NIFTYJUNIOR': 69820.30,
  'NIFTYMIDCAP150': 20450.15,
  'NIFTY500': 22150.80,
}

interface PriceState {
  open: number
  high: number
  low: number
  ltP: number
  pCh: number
  pChg: number
}

// Module-level global state cache
const priceCache: Record<string, PriceState> = {}

function getDriftedIndex(indexInfo: typeof INDICES[0]) {
  const base = BASE_PRICES[indexInfo.symbol] || 15000
  
  if (!priceCache[indexInfo.symbol]) {
    // Initialise with some static randomized starting point around base
    const open = base * (1 + (Math.random() * 0.004 - 0.002)) // open price: base +/- 0.2%
    priceCache[indexInfo.symbol] = {
      open,
      high: open * 1.005,
      low: open * 0.995,
      ltP: open * (1 + (Math.random() * 0.002 - 0.001)),
      pCh: 0,
      pChg: 0,
    }
  }

  const cached = priceCache[indexInfo.symbol]
  
  // Drift the LTP slightly: random walk between -0.06% and +0.06%
  const driftPercent = (Math.random() * 0.0012 - 0.0006)
  let newLtp = cached.ltP * (1 + driftPercent)

  // Bound the LTP to within +/- 1.5% of the base price
  const minAllowed = base * 0.985
  const maxAllowed = base * 1.015
  newLtp = Math.max(minAllowed, Math.min(maxAllowed, newLtp))

  // Calculate change and percentage from open price
  const pCh = newLtp - cached.open
  const pChg = (pCh / cached.open) * 100

  // Update record
  priceCache[indexInfo.symbol] = {
    open: cached.open,
    high: Math.max(cached.high, newLtp),
    low: Math.min(cached.low, newLtp),
    ltP: newLtp,
    pCh: parseFloat(pCh.toFixed(2)),
    pChg: parseFloat(pChg.toFixed(2)),
  }

  return {
    ...indexInfo,
    open: parseFloat(priceCache[indexInfo.symbol].open.toFixed(2)),
    high: parseFloat(priceCache[indexInfo.symbol].high.toFixed(2)),
    low: parseFloat(priceCache[indexInfo.symbol].low.toFixed(2)),
    ltP: parseFloat(priceCache[indexInfo.symbol].ltP.toFixed(2)),
    pCh: priceCache[indexInfo.symbol].pCh,
    pChg: priceCache[indexInfo.symbol].pChg,
  }
}

export async function GET() {
  try {
    const yahooIndices = await getYahooIndices()
    if (yahooIndices && yahooIndices.length > 0) {
      return NextResponse.json(yahooIndices, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      })
    }
  } catch (error) {
    console.warn('Failed to fetch Yahoo indices, falling back to simulated indices:', error)
  }

  // Fallback to simulated drifting data
  const fallbackIndices = INDICES.map((indexInfo) => getDriftedIndex(indexInfo))
  return NextResponse.json(fallbackIndices, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    },
  })
}
