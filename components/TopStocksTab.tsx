'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useStocks, useMarketStatus } from '@/lib/hooks/useMarketData'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
import { formatPrice, formatChange, formatChangePercent } from '@/lib/utils/formatters'

interface StockItem {
  symbol: string
  name: string
  ltP: number
  pCh: number
  pChg: number
  volume: number
  marketCap?: number
  tickDirection?: 'up' | 'down' | null
}

const FALLBACK_GAINERS: StockItem[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', ltP: 2945.30, pCh: 45.30, pChg: 1.56, volume: 5400000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', ltP: 1380.25, pCh: 32.10, pChg: 2.38, volume: 3200000 },
  { symbol: 'SBI', name: 'State Bank of India', ltP: 832.90, pCh: 16.50, pChg: 2.02, volume: 11200000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', ltP: 1612.45, pCh: 24.30, pChg: 1.53, volume: 8900000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', ltP: 1124.80, pCh: 14.80, pChg: 1.33, volume: 6500000 },
]

const FALLBACK_LOSERS: StockItem[] = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', ltP: 3820.15, pCh: -78.40, pChg: -2.01, volume: 2100000 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', ltP: 2485.30, pCh: -42.70, pChg: -1.69, volume: 2200000 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', ltP: 2912.40, pCh: -38.60, pChg: -1.31, volume: 1100000 },
  { symbol: 'ITC', name: 'ITC Ltd.', ltP: 432.75, pCh: -5.45, pChg: -1.24, volume: 12400000 },
  { symbol: 'LICHSGFIN', name: 'LIC Housing Finance', ltP: 742.15, pCh: -8.85, pChg: -1.18, volume: 1500000 },
]

export function TopStocksTab() {
  const { stocks, isLoading } = useStocks(50, { refreshInterval: 5000 })
  const { status: marketStatus } = useMarketStatus()
  const isMarketLive = marketStatus === 'open'
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers')
  const [displayGainers, setDisplayGainers] = useState<StockItem[]>([])
  const [displayLosers, setDisplayLosers] = useState<StockItem[]>([])

  useEffect(() => {
    if (!stocks || stocks.length === 0) {
      setDisplayGainers(FALLBACK_GAINERS)
      setDisplayLosers(FALLBACK_LOSERS)
      return
    }

    const mapped: StockItem[] = stocks.map((s: any) => ({
      symbol: s.symbol,
      name: s.name || s.symbol,
      ltP: Number(s.ltP) || 0,
      pCh: Number(s.pCh) || 0,
      pChg: Number(s.pChg) || 0,
      volume: Number(s.volume) || 0,
    }))

    // Sort and split
    const sortedGainers = [...mapped]
      .filter((s) => s.pChg > 0)
      .sort((a, b) => b.pChg - a.pChg)
      .slice(0, 5)

    const sortedLosers = [...mapped]
      .filter((s) => s.pChg < 0)
      .sort((a, b) => a.pChg - b.pChg)
      .slice(0, 5)

    // Fall back to predefined list if none found in API
    setDisplayGainers(sortedGainers.length > 0 ? sortedGainers : FALLBACK_GAINERS)
    setDisplayLosers(sortedLosers.length > 0 ? sortedLosers : FALLBACK_LOSERS)
  }, [stocks])

  // Micro-ticks simulation for stock components (runs every 2.5 seconds)
  useEffect(() => {
    if (!isMarketLive) return // Stop fluctuations when market is closed
    const interval = setInterval(() => {
      const randomizeList = (list: StockItem[]) =>
        list.map((item) => {
          const drift = item.ltP * (Math.random() * 0.0002 - 0.0001) // +/- 0.01%
          const newPrice = item.ltP + drift
          const newChange = item.pCh + drift
          const openPrice = item.ltP - item.pCh
          const newChg = openPrice > 0 ? (newChange / openPrice) * 100 : 0
          
          let tickDirection: 'up' | 'down' | null = null
          if (drift > 0.05) tickDirection = 'up'
          else if (drift < -0.05) tickDirection = 'down'

          return {
            ...item,
            ltP: newPrice,
            pCh: newChange,
            pChg: newChg,
            tickDirection,
          }
        })

      setDisplayGainers((prev) => randomizeList(prev))
      setDisplayLosers((prev) => randomizeList(prev))

      setTimeout(() => {
        const resetTicks = (list: StockItem[]) => list.map((item) => ({ ...item, tickDirection: null }))
        setDisplayGainers((prev) => resetTicks(prev))
        setDisplayLosers((prev) => resetTicks(prev))
      }, 500)
    }, 2500)

    return () => clearInterval(interval)
  }, [isMarketLive])

  const currentItems = activeTab === 'gainers' ? displayGainers : displayLosers

  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-12 md:py-16 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
              Market Movers
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1 text-sm">
              Top performing stocks on the National Stock Exchange of India (NSE)
            </p>
          </div>

          {/* Tabs switch */}
          <div className="flex bg-[#F3F4F6] dark:bg-[#1A1A1C] p-1.5 rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] self-start md:self-auto">
            <button
              onClick={() => setActiveTab('gainers')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'gainers'
                  ? 'bg-white dark:bg-[#2A2A2D] text-[#00D09C] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Top Gainers
            </button>
            <button
              onClick={() => setActiveTab('losers')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'losers'
                  ? 'bg-white dark:bg-[#2A2A2D] text-[#E74C3C] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Top Losers
            </button>
          </div>
        </div>

        {/* Dashboard Grid Card */}
        <div className="bg-[#FAFBFB] dark:bg-[#151517] border border-[#E8E8E8] dark:border-[#262628] rounded-xl overflow-hidden shadow-sm">
          {/* Header Row */}
          <div className="grid grid-cols-3 md:grid-cols-4 px-6 py-4 border-b border-[#E8E8E8] dark:border-[#262628] text-[11px] font-bold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider uppercase bg-[#F4F6F6] dark:bg-[#1A1A1C]">
            <div className="col-span-1 md:col-span-2">Company</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
          </div>

          {/* List Content */}
          <div className="divide-y divide-[#E8E8E8] dark:divide-[#262628]">
            <AnimatePresence mode="wait">
              {currentItems.map((item, idx) => {
                const isPositive = item.pChg >= 0
                const flashClass = item.tickDirection === 'up'
                  ? 'bg-green-50/50 dark:bg-[#1A3A36]/20'
                  : item.tickDirection === 'down'
                    ? 'bg-red-50/50 dark:bg-[#3A1A1A]/20'
                    : 'hover:bg-[#F3F4F4]/50 dark:hover:bg-[#1C1C1E]/50'

                return (
                  <Link href={`/stocks/${item.symbol}`} key={item.symbol}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={`grid grid-cols-3 md:grid-cols-4 px-6 py-4 items-center cursor-pointer transition-colors duration-300 ${flashClass}`}
                    >
                      {/* Name */}
                      <div className="col-span-1 md:col-span-2 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A1A1A] dark:text-white text-sm whitespace-nowrap hover:text-[#44C2A4] transition-colors">
                            {item.symbol}
                          </span>
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 text-[#00D09C] flex-shrink-0" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-[#E74C3C] flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate block mt-0.5">
                          {item.name}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                          {formatPrice(item.ltP)}
                        </span>
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mt-0.5">
                          Vol: {item.volume.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Change */}
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-sm font-bold ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                          {formatChange(item.pCh)}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                          isPositive
                            ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                            : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                        }`}>
                          {formatChangePercent(item.pChg)}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* View All Stocks Link */}
        <div className="text-center mt-8">
          <Link
            href="/stocks"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-full text-sm font-semibold text-[#1A1A1A] dark:text-white hover:border-[#44C2A4] dark:hover:border-[#44C2A4] hover:text-[#44C2A4] transition-all duration-300"
          >
            View Live Stock Market &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
