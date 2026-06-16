import { NextResponse } from 'next/server'

export const revalidate = 60

function isMarketOpen() {
  const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const now = new Date(istDateString)
  const dayOfWeek = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // Markets are open Monday-Friday (1-5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  // NSE Trading Hours: 9:15 AM to 3:30 PM IST
  const timeInMinutes = hours * 60 + minutes
  const marketOpen = 9 * 60 + 15 // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM

  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose
}

export async function GET() {
  try {
    const isOpen = isMarketOpen()

    return NextResponse.json(
      {
        status: isOpen ? 'open' : 'closed',
        message: isOpen
          ? 'Market is currently open'
          : 'Market is currently closed',
        lastUpdate: new Date().toISOString(),
        marketHours: {
          open: '09:15 AM',
          close: '03:30 PM',
          timezone: 'IST',
        },
        exchanges: [
          {
            name: 'NSE',
            status: isOpen ? 'open' : 'closed',
          },
          {
            name: 'BSE',
            status: isOpen ? 'open' : 'closed',
          },
          {
            name: 'NCDEX',
            status: isOpen ? 'open' : 'closed',
          },
        ],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching market status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market status' },
      { status: 500 }
    )
  }
}
