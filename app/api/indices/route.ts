import { NextResponse } from 'next/server'
import { MarketPlusService } from '@/lib/marketplus'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const indices = await MarketPlusService.getIndices()
    return NextResponse.json(indices)
  } catch (error) {
    console.error('Error fetching indices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indices' },
      { status: 500 }
    )
  }
}
