import { NextRequest, NextResponse } from 'next/server'
import { getYahooChartHistory, getYahooChartHistoryFromCandidates } from '@/lib/utils/nseHelper'
import { buildYahooCandidates, findStockInMaster } from '@/lib/utils/stockMaster'

export const revalidate = 60 // Revalidate every 60 seconds for historical data

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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '1mo'
    const interval = searchParams.get('interval') || '1d'

    const directoryStock = await findStockInMaster(symbol)
    const history = directoryStock
      ? await getYahooChartHistoryFromCandidates(buildYahooCandidates(directoryStock), range, interval)
      : await getYahooChartHistory(symbol, range, interval)

    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: `No history data found for symbol ${symbol}` },
        { status: 404 }
      )
    }

    return NextResponse.json(history, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error in historical quotes API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical stock data' },
      { status: 500 }
    )
  }
}
