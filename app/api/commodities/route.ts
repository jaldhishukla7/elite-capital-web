import { NextResponse } from 'next/server'
import { getYahooCommodities } from '@/lib/utils/nseHelper'

export const revalidate = 10

const COMMODITIES = [
  {
    symbol: 'GOLD',
    name: 'Gold (Per Gram)',
    unit: '₹',
    price: 7234.50,
    change: 145.00,
    changePercent: 2.05,
  },
  {
    symbol: 'SILVER',
    name: 'Silver (Per Kg)',
    unit: '₹',
    price: 89234.00,
    change: 1245.00,
    changePercent: 1.42,
  },
  {
    symbol: 'CRUDE',
    name: 'Crude Oil (Per Barrel)',
    unit: '₹',
    price: 6550.00,
    change: 100.00,
    changePercent: 1.55,
  },
  {
    symbol: 'COPPER',
    name: 'Copper (Per Kg)',
    unit: '₹',
    price: 1023.45,
    change: 23.50,
    changePercent: 2.35,
  },
  {
    symbol: 'NATURALGAS',
    name: 'Natural Gas',
    unit: '₹',
    price: 234.50,
    change: -12.30,
    changePercent: -4.98,
  },
]

interface CommodityState {
  price: number
  change: number
  changePercent: number
}

// Module-level global state cache
const commodityCache: Record<string, CommodityState> = {}

function getDriftedCommodity(commodity: typeof COMMODITIES[0]) {
  if (!commodityCache[commodity.symbol]) {
    commodityCache[commodity.symbol] = {
      price: commodity.price,
      change: commodity.change,
      changePercent: commodity.changePercent,
    }
  }

  const cached = commodityCache[commodity.symbol]
  
  // Drift price slightly (random walk: +/- 0.05%)
  const driftPercent = (Math.random() * 0.001 - 0.0005)
  let newPrice = cached.price * (1 + driftPercent)

  // Bound the drifted price to +/- 2% of original price
  const minAllowed = commodity.price * 0.98
  const maxAllowed = commodity.price * 1.02
  newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice))

  const openPrice = commodity.price - commodity.change
  const change = newPrice - openPrice
  const changePercent = (change / openPrice) * 100

  commodityCache[commodity.symbol] = {
    price: newPrice,
    change,
    changePercent,
  }

  return {
    ...commodity,
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
  }
}

export async function GET() {
  try {
    const yahooComm = await getYahooCommodities()
    if (yahooComm && yahooComm.length > 0) {
      const merged = COMMODITIES.map((c) => {
        const found = yahooComm.find((y) => y.symbol === c.symbol)
        if (found) {
          return {
            ...c,
            price: parseFloat(found.price.toFixed(2)),
            change: parseFloat(found.change.toFixed(2)),
            changePercent: parseFloat(found.changePercent.toFixed(2)),
          }
        }
        return getDriftedCommodity(c)
      })

      return NextResponse.json(merged, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      })
    }
  } catch (error) {
    console.warn('Failed to fetch Yahoo commodities, falling back to simulated data:', error)
  }

  // Fallback to simulated drifting data
  const commodities = COMMODITIES.map((commodity) => getDriftedCommodity(commodity))
  return NextResponse.json(commodities, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    },
  })
}
