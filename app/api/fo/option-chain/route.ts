import { NextRequest, NextResponse } from 'next/server'
import { MarketPlusService } from '@/lib/marketplus'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol') || 'NIFTY'

    const optionChain = await MarketPlusService.getOptionChain(symbol)
    if (!optionChain) {
      return NextResponse.json({ error: 'Option chain data unavailable from exchange.' }, { status: 404 })
    }

    return NextResponse.json(optionChain)
  } catch (error) {
    console.error('Error in F&O Option Chain API:', error)
    return NextResponse.json({ error: 'Failed to fetch option chain data.' }, { status: 500 })
  }
}
