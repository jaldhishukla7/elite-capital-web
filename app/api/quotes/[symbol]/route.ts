import { NextRequest, NextResponse } from 'next/server'
import { getAllQuotes } from '@/lib/utils/nseHelper'

export const revalidate = 10 // Revalidate every 10 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Fetch all quotes and find the matching symbol
    const allQuotes = await getAllQuotes()
    
    if (!allQuotes || allQuotes.length === 0) {
      return NextResponse.json(
        { error: 'Unable to fetch stock data' },
        { status: 500 }
      )
    }

    // Find the stock by symbol (case-insensitive)
    const stock = allQuotes.find(
      (item: any) => item.symbol?.toUpperCase() === symbol.toUpperCase()
    )

    if (!stock) {
      return NextResponse.json(
        { error: `Stock symbol ${symbol} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(stock, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    )
  }
}
