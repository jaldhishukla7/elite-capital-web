import { NextResponse } from 'next/server'

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
    unit: '$',
    price: 78.45,
    change: 1.20,
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

export async function GET() {
  try {
    // Add slight variations for realism
    const commodities = COMMODITIES.map((commodity) => {
      const variation = (Math.random() - 0.5) * 2
      const newChange = commodity.change + variation
      const newPrice = commodity.price + newChange
      const newChangePercent = ((newChange / (commodity.price - newChange)) * 100).toFixed(2)

      return {
        ...commodity,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(newChange.toFixed(2)),
        changePercent: parseFloat(newChangePercent),
      }
    })

    return NextResponse.json(commodities, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching commodities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodities data' },
      { status: 500 }
    )
  }
}
