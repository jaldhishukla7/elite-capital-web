import { NextRequest, NextResponse } from 'next/server'
import { MarketPlusService } from '@/lib/marketplus'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols') || ''
    
    if (!symbolsParam.trim()) {
      return NextResponse.json([])
    }

    const symbols = symbolsParam
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const quotes = await MarketPlusService.getBatchQuotes(symbols)
    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error in batch quotes API:', error)
    return NextResponse.json({ error: 'Failed to fetch batch quotes' }, { status: 500 })
  }
}
