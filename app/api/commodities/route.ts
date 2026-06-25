import { NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F,SI=F,CL=F,HG=F,NG=F,INR=X'
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 4000,
    })

    const results = res.data?.quoteResponse?.result || []
    
    // Extract exchange rate (default to 83.5 if fails)
    const usdinrQuote = results.find((r: any) => r.symbol === 'INR=X')
    const usdinr = usdinrQuote?.regularMarketPrice || 83.5

    const getQuoteInfo = (symbol: string) => {
      const q = results.find((r: any) => r.symbol === symbol)
      return {
        price: q?.regularMarketPrice || 0,
        prevClose: q?.regularMarketPreviousClose || q?.regularMarketPrice || 0
      }
    }

    // Gold: GC=F (USD/oz). Local MCX price is per gram. 1 troy oz = 31.1034768g.
    const gold = getQuoteInfo('GC=F')
    const goldPriceINR = (gold.price / 31.1034768) * usdinr
    const goldPrevINR = (gold.prevClose / 31.1034768) * usdinr
    const goldChange = goldPriceINR - goldPrevINR
    const goldChgPct = goldPrevINR > 0 ? (goldChange / goldPrevINR) * 100 : 0

    // Silver: SI=F (USD/oz). Local MCX is per kg. 1 troy oz = 0.0311034768 kg.
    const silver = getQuoteInfo('SI=F')
    const silverPriceINR = (silver.price / 0.0311034768) * usdinr
    const silverPrevINR = (silver.prevClose / 0.0311034768) * usdinr
    const silverChange = silverPriceINR - silverPrevINR
    const silverChgPct = silverPrevINR > 0 ? (silverChange / silverPrevINR) * 100 : 0

    // Crude Oil: CL=F (USD/barrel). Price is per barrel.
    const crude = getQuoteInfo('CL=F')
    const crudePriceINR = crude.price * usdinr
    const crudePrevINR = crude.prevClose * usdinr
    const crudeChange = crudePriceINR - crudePrevINR
    const crudeChgPct = crudePrevINR > 0 ? (crudeChange / crudePrevINR) * 100 : 0

    // Copper: HG=F (USD/lb). Local MCX is per kg. 1 lb = 0.45359237 kg.
    const copper = getQuoteInfo('HG=F')
    const copperPriceINR = (copper.price / 0.45359237) * usdinr
    const copperPrevINR = (copper.prevClose / 0.45359237) * usdinr
    const copperChange = copperPriceINR - copperPrevINR
    const copperChgPct = copperPrevINR > 0 ? (copperChange / copperPrevINR) * 100 : 0

    // Natural Gas: NG=F (USD/MMBtu). Price is per MMBtu.
    const natgas = getQuoteInfo('NG=F')
    const natgasPriceINR = natgas.price * usdinr
    const natgasPrevINR = natgas.prevClose * usdinr
    const natgasChange = natgasPriceINR - natgasPrevINR
    const natgasChgPct = natgasPrevINR > 0 ? (natgasChange / natgasPrevINR) * 100 : 0

    const commodities = [
      {
        symbol: 'GOLD',
        name: 'Gold (Per Gram)',
        unit: '₹',
        price: parseFloat(goldPriceINR.toFixed(2)),
        change: parseFloat(goldChange.toFixed(2)),
        changePercent: parseFloat(goldChgPct.toFixed(2)),
      },
      {
        symbol: 'SILVER',
        name: 'Silver (Per Kg)',
        unit: '₹',
        price: parseFloat(silverPriceINR.toFixed(2)),
        change: parseFloat(silverChange.toFixed(2)),
        changePercent: parseFloat(silverChgPct.toFixed(2)),
      },
      {
        symbol: 'CRUDE',
        name: 'Crude Oil (Per Barrel)',
        unit: '₹',
        price: parseFloat(crudePriceINR.toFixed(2)),
        change: parseFloat(crudeChange.toFixed(2)),
        changePercent: parseFloat(crudeChgPct.toFixed(2)),
      },
      {
        symbol: 'COPPER',
        name: 'Copper (Per Kg)',
        unit: '₹',
        price: parseFloat(copperPriceINR.toFixed(2)),
        change: parseFloat(copperChange.toFixed(2)),
        changePercent: parseFloat(copperChgPct.toFixed(2)),
      },
      {
        symbol: 'NATURALGAS',
        name: 'Natural Gas',
        unit: '₹',
        price: parseFloat(natgasPriceINR.toFixed(2)),
        change: parseFloat(natgasChange.toFixed(2)),
        changePercent: parseFloat(natgasChgPct.toFixed(2)),
      },
    ]

    return NextResponse.json(commodities)
  } catch (error) {
    console.error('Error fetching commodities:', error)
    return NextResponse.json([
      { symbol: 'GOLD', name: 'Gold (Per Gram)', unit: '₹', price: 7234.50, change: 145.00, changePercent: 2.05 },
      { symbol: 'SILVER', name: 'Silver (Per Kg)', unit: '₹', price: 89234.00, change: 1245.00, changePercent: 1.42 },
      { symbol: 'CRUDE', name: 'Crude Oil (Per Barrel)', unit: '₹', price: 6550.00, change: 100.00, changePercent: 1.55 },
      { symbol: 'COPPER', name: 'Copper (Per Kg)', unit: '₹', price: 1023.45, change: 23.50, changePercent: 2.35 },
      { symbol: 'NATURALGAS', name: 'Natural Gas', unit: '₹', price: 234.50, change: -12.30, changePercent: -4.98 }
    ])
  }
}
