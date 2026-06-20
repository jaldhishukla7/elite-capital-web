import { NextResponse } from 'next/server'
import { getQuotesForStocks } from '@/lib/utils/nseHelper'
import { getStockPage } from '@/lib/utils/stockMaster'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const query = searchParams.get('q') || ''
    const exchangeParam = searchParams.get('exchange') || 'all'
    const exchange = ['all', 'NSE', 'BSE'].includes(exchangeParam) ? exchangeParam as 'all' | 'NSE' | 'BSE' : 'all'
    const includeQuotes = searchParams.get('quotes') !== '0'

    const stockPage = await getStockPage({ query, page, limit, exchange })
    const stocks = includeQuotes ? await getQuotesForStocks(stockPage.data) : stockPage.data

    if (!stocks) {
      return NextResponse.json(
        { error: 'Unable to fetch stock data' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        data: stocks,
        count: stockPage.count,
        page: stockPage.page,
        limit: stockPage.limit,
        totalPages: stockPage.totalPages,
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
