import { NextRequest, NextResponse } from 'next/server'
import { getSingleQuote, getSingleQuoteFromCandidates } from '@/lib/utils/nseHelper'
import { findStockInMaster } from '@/lib/utils/stockMaster'

export const revalidate = 5 // Revalidate every 5 seconds

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

    const directoryStock = await findStockInMaster(symbol)
    const stock = directoryStock
      ? await getSingleQuoteFromCandidates(directoryStock)
      : await getSingleQuote(symbol)

    if (!stock) {
      return NextResponse.json(
        { error: `Stock symbol ${symbol} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(stock, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
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
