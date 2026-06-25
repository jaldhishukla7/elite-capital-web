import { NextResponse } from 'next/server'

export const revalidate = 60

const HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  '2026-03-03', // Holi
  '2026-03-26', // Shri Ram Navami
  '2026-03-31', // Shri Mahavir Jayanti
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Baba Saheb Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-05-28', // Bakri Id
  '2026-06-26', // Muharram
  '2026-09-14', // Ganesh Chaturthi
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-10', // Diwali-Balipratipada
  '2026-11-24', // Prakash Gurpurb Sri Guru Nanak Dev
  '2026-12-25', // Christmas
]

function isMarketOpen() {
  const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const now = new Date(istDateString)
  const dayOfWeek = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // Format date as YYYY-MM-DD
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const formattedDate = `${year}-${month}-${date}`

  // Markets are open Monday-Friday (1-5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  // Check if it is a public trading holiday
  if (HOLIDAYS_2026.includes(formattedDate)) {
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
