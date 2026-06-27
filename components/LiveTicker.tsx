'use client'

import { useState, useEffect } from 'react'
import { useIndices, useCommodities, useMarketStatus } from '@/lib/hooks/useMarketData'
import { formatChange, formatChangePercent } from '@/lib/utils/formatters'

interface TickerItem {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  changePercent: number
  unit?: string
  isIndex: boolean
  tickDirection?: 'up' | 'down' | null
}

const FALLBACK_ITEMS: TickerItem[] = [
  { id: 'NIFTY50', symbol: 'NIFTY50', name: 'NIFTY 50', price: 23824.10, change: 125.40, changePercent: 0.54, isIndex: true },
  { id: 'SENSEX', symbol: 'SENSEX', name: 'SENSEX', price: 77824.10, change: 312.50, changePercent: 0.41, isIndex: true },
  { id: 'NIFTYBANK', symbol: 'NIFTYBANK', name: 'NIFTY BANK', price: 51920.40, change: 120.00, changePercent: 0.23, isIndex: true },
  { id: 'NIFTYMIDCAP150', symbol: 'NIFTYMIDCAP150', name: 'NIFTY MIDCAP 150', price: 20450.15, change: 78.90, changePercent: 0.39, isIndex: true },
  { id: 'NIFTY500', symbol: 'NIFTY500', name: 'NIFTY 500', price: 22150.80, change: 89.20, changePercent: 0.40, isIndex: true },
  { id: 'GOLD', symbol: 'GOLD', name: 'GOLD', price: 7234.50, change: 145.00, changePercent: 2.05, unit: '₹', isIndex: false },
  { id: 'SILVER', symbol: 'SILVER', name: 'SILVER', price: 89234.00, change: -124.00, changePercent: -0.14, unit: '₹', isIndex: false },
  { id: 'CRUDE', symbol: 'CRUDE', name: 'CRUDE OIL', price: 6550.00, change: 100.00, changePercent: 1.55, unit: '₹', isIndex: false },
]

export function LiveTicker() {
  const { indices, isLoading: indicesLoading } = useIndices({ refreshInterval: 5000 })
  const { commodities, isLoading: commLoading } = useCommodities({ refreshInterval: 5000 })
  const { status: marketStatus, isLoading: statusLoading } = useMarketStatus()
  const [items, setItems] = useState<TickerItem[]>([])

  const isLoading = indicesLoading || commLoading || statusLoading
  const isMarketLive = marketStatus === 'open'

  const indicesStr = JSON.stringify(indices)
  const commoditiesStr = JSON.stringify(commodities)

  // Map server updates into our state
  useEffect(() => {
    if ((!indices || indices.length === 0) && (!commodities || commodities.length === 0)) return

    const formattedIndices: TickerItem[] = (indices || []).map((ind: any) => ({
      id: ind.symbol,
      name: ind.name || ind.symbol,
      symbol: ind.symbol,
      price: Number(ind.ltP) || 0,
      change: Number(ind.pCh) || 0,
      changePercent: Number(ind.pChg) || 0,
      isIndex: true,
    }))

    const formattedCommodities: TickerItem[] = (commodities || []).map((comm: any) => {
      // Standardize Crude Oil name and casing for Gold/Silver
      let displayName = comm.name || comm.symbol
      if (comm.symbol === 'CRUDE') {
        displayName = 'CRUDE OIL'
      } else if (comm.symbol === 'GOLD') {
        displayName = 'GOLD'
      } else if (comm.symbol === 'SILVER') {
        displayName = 'SILVER'
      }
      return {
        id: comm.symbol,
        name: displayName,
        symbol: comm.symbol,
        price: Number(comm.price) || 0,
        change: Number(comm.change) || 0,
        changePercent: Number(comm.changePercent) || 0,
        unit: comm.unit || '',
        isIndex: false,
      }
    })

    const combined = [...formattedIndices, ...formattedCommodities]
    
    // Filter to display only specific desired indices & commodities
    const desiredSymbols = ['NIFTY50', 'SENSEX', 'NIFTYBANK', 'NIFTYMIDCAP150', 'NIFTY500', 'GOLD', 'SILVER', 'CRUDE']
    const filtered = combined.filter(item => desiredSymbols.includes(item.symbol))
    
    // Sort in preferred display order: NIFTY 50, SENSEX, NIFTY BANK, NIFTY MIDCAP 150, NIFTY 500, GOLD, SILVER, CRUDE OIL
    const orderMap: Record<string, number> = {
      'NIFTY50': 0,
      'SENSEX': 1,
      'NIFTYBANK': 2,
      'NIFTYMIDCAP150': 3,
      'NIFTY500': 4,
      'GOLD': 5,
      'SILVER': 6,
      'CRUDE': 7,
    }
    filtered.sort((a, b) => (orderMap[a.symbol] ?? 99) - (orderMap[b.symbol] ?? 99))

    setItems((prevItems) => {
      if (prevItems.length === 0) return filtered
      return filtered.map((newItem) => {
        const existing = prevItems.find((p) => p.symbol === newItem.symbol)
        return {
          ...newItem,
          tickDirection: existing ? existing.tickDirection : null,
        }
      })
    })
  }, [indicesStr, commoditiesStr])

  // Client-side micro-fluctuations simulator (runs every 1.8 seconds)
  useEffect(() => {
    if (!isMarketLive) return // Stop fluctuations when market is closed
    const activeItems = items.length > 0 ? items : FALLBACK_ITEMS
    if (activeItems.length === 0) return

    const interval = setInterval(() => {
      setItems((prevItems) => {
        const currentList = prevItems.length > 0 ? prevItems : FALLBACK_ITEMS
        return currentList.map((item) => {
          // Micro-drift the price: random walk of +/- 0.012%
          const driftPercent = (Math.random() * 0.00024 - 0.00012)
          const priceDiff = item.price * driftPercent
          const newPrice = item.price + priceDiff
          const newChange = item.change + priceDiff
          const openPrice = item.price - item.change
          const newChangePercent = openPrice > 0 ? (newChange / openPrice) * 100 : 0

          let tickDirection: 'up' | 'down' | null = null
          if (priceDiff > 0.02) {
            tickDirection = 'up'
          } else if (priceDiff < -0.02) {
            tickDirection = 'down'
          }

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            tickDirection,
          }
        })
      })

      // Reset flash highlight after 600ms
      setTimeout(() => {
        setItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            tickDirection: null,
          }))
        )
      }, 600)
    }, 1800)

    return () => clearInterval(interval)
  }, [items.length, isMarketLive])

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS

  const formatPriceValue = (price: number, unit?: string) => {
    const formatted = price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return unit ? `${unit}${formatted}` : formatted
  }

  return (
    <div className="sticky top-16 z-30 w-full h-[64px] bg-white dark:bg-[#0D0D0D] border-b border-[#E8E8E8] dark:border-[#2A2A2A] flex items-center overflow-hidden">
      {/* CSS infinite ticker marquee styling */}
      <style>{`
        @keyframes ticker-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .ticker-container:hover .ticker-marquee-track {
          animation-play-state: paused;
        }
        .ticker-marquee-track {
          display: inline-flex;
          width: max-content;
          animation: ticker-marquee 35s linear infinite;
          gap: 12px;
        }
      `}</style>

      {/* Live / Closed Label on Left */}
      <div className="flex items-center gap-2 pl-4 pr-3 border-r border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] h-full z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] tracking-widest whitespace-nowrap">
          {isMarketLive ? 'LIVE' : 'CLOSED'}
        </span>
        <div className={`w-2 h-2 rounded-full relative flex`}>
          {isMarketLive ? (
            <>
              <div className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-[#00D09C]'}`}></div>
              <div className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-amber-500' : 'bg-[#00D09C]'}`}></div>
            </>
          ) : (
            <div className="relative inline-flex rounded-full h-2 w-2 bg-[#E74C3C]"></div>
          )}
        </div>
      </div>

      {/* Scrolling Ticker Track */}
      <div className="flex-1 overflow-hidden ticker-container flex items-center relative h-full">
        {/* Shadow overlays on sides */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-[#0D0D0D] z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-[#0D0D0D] z-10 pointer-events-none"></div>

        <div className="ticker-marquee-track">
          {/* First set of cards */}
          {displayItems.map((item, idx) => {
            const isPositive = item.change >= 0
            const flashClass = item.tickDirection === 'up'
              ? 'bg-green-50/80 dark:bg-[#1A3A36]/40 border-[#00D09C] scale-[1.01]'
              : item.tickDirection === 'down'
                ? 'bg-red-50/80 dark:bg-[#3A1A1A]/40 border-[#E74C3C] scale-[1.01]'
                : 'bg-[#F9FAFB] dark:bg-[#161618] border-[#E8E8E8] dark:border-[#262628] hover:border-[#44C2A4] dark:hover:border-[#44C2A4]'

            return (
              <div
                key={`${item.id}-set1-${idx}`}
                className={`flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-lg border w-[205px] h-[48px] shadow-sm select-none cursor-pointer transition-all duration-300 ${flashClass}`}
              >
                {/* Index Info */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] tracking-wide uppercase truncate leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[13px] font-bold text-[#1A1A1A] dark:text-white leading-tight mt-0.5 transition-colors duration-150">
                    {formatPriceValue(item.price, item.unit)}
                  </span>
                </div>

                {/* Performance Info */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-[11px] font-bold leading-tight transition-colors duration-150 ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                    {formatChange(item.change)}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 leading-tight transition-all duration-150 ${
                    isPositive
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                  }`}>
                    {formatChangePercent(item.changePercent)}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Second duplicate set of cards */}
          {displayItems.map((item, idx) => {
            const isPositive = item.change >= 0
            const flashClass = item.tickDirection === 'up'
              ? 'bg-green-50/80 dark:bg-[#1A3A36]/40 border-[#00D09C] scale-[1.01]'
              : item.tickDirection === 'down'
                ? 'bg-red-50/80 dark:bg-[#3A1A1A]/40 border-[#E74C3C] scale-[1.01]'
                : 'bg-[#F9FAFB] dark:bg-[#161618] border-[#E8E8E8] dark:border-[#262628] hover:border-[#44C2A4] dark:hover:border-[#44C2A4]'

            return (
              <div
                key={`${item.id}-set2-${idx}`}
                className={`flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-lg border w-[205px] h-[48px] shadow-sm select-none cursor-pointer transition-all duration-300 ${flashClass}`}
              >
                {/* Index Info */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] tracking-wide uppercase truncate leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[13px] font-bold text-[#1A1A1A] dark:text-white leading-tight mt-0.5 transition-colors duration-150">
                    {formatPriceValue(item.price, item.unit)}
                  </span>
                </div>

                {/* Performance Info */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-[11px] font-bold leading-tight transition-colors duration-150 ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                    {formatChange(item.change)}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 leading-tight transition-all duration-150 ${
                    isPositive
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                  }`}>
                    {formatChangePercent(item.changePercent)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
