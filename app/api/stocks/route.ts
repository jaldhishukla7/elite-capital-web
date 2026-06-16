import { NextResponse } from 'next/server'
import { getAllQuotes } from 'stock-nse-india'

export const revalidate = 10

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const allQuotes = await getAllQuotes()

    if (!allQuotes || allQuotes.length === 0) {
      return NextResponse.json(
        { error: 'Unable to fetch stock data' },
        { status: 500 }
      )
    }

    // Return limited stocks sorted by change
    const stocks = allQuotes
      .slice(0, limit)
      .map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        ltP: stock.ltP,
        open: stock.open,
        high: stock.high,
        low: stock.low,
        pCh: stock.pCh,
        pChg: stock.pChg,
        volume: stock.volume,
        marketCap: stock.marketCap,
      }))

    return NextResponse.json(
      {
        data: stocks,
        count: stocks.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stocks data' },
      { status: 500 }
    )
  }
}
