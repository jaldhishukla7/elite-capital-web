import { NextRequest, NextResponse } from 'next/server'
import { MarketPlusService } from '@/lib/marketplus'

export const dynamic = 'force-dynamic'

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

    const stock = await MarketPlusService.getSingleQuote(symbol)

    if (!stock) {
      return NextResponse.json(
        { error: `Stock symbol ${symbol} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(stock)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock quote' },
      { status: 500 }
    )
  }
}
