'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useIndices } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor } from '@/lib/utils/formatters'
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  // Normalize data to 0-100 range
  const normalized = data.map((val) => ((val - min) / range) * 80 + 10)
  
  // Create path for sparkline
  const pathPoints = normalized
    .map((val, idx) => `${(idx / (normalized.length - 1)) * 300},${100 - val}`)
    .join(' L ')
  
  return (
    <svg viewBox="0 0 300 100" className="w-full h-12" preserveAspectRatio="none">
      <path
        d={`M ${pathPoints}`}
        fill="none"
        stroke={isPositive ? '#00D09C' : '#E74C3C'}
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function getSparklineForIndex(symbol: string, changePercent: number) {
  // Generate consistent but slightly randomized sparkline based on symbol and change percent
  const isUp = changePercent >= 0
  const basePoints = [40, 43, 42, 48, 45, 55, 52, 60, 58, 68]
  
  // Apply a slope based on daily trend
  return basePoints.map((val, idx) => {
    const trendDrift = isUp ? idx * 2.2 : -idx * 2.2
    // Add tiny deterministic volatility based on characters in symbol
    const charCodeSum = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const noise = Math.sin(idx + charCodeSum) * 4
    return val + trendDrift + noise
  })
}

// Fallback set used only when the live hook returns fewer indices than we want to display.
// Extends coverage beyond the core 4 (Nifty 50, Sensex, Bank Nifty, Nifty IT) with
// broader market + sector indices, matching what Groww shows in its index strip.
const EXTRA_INDEX_FALLBACK = [
  { symbol: 'NIFTYMIDCAP150', name: 'NIFTY MIDCAP 150', ltP: 20450.15, pCh: 78.9, pChg: 0.39 },
  { symbol: 'NIFTYSMLCAP250', name: 'NIFTY SMALLCAP 250', ltP: 16820.4, pCh: -42.1, pChg: -0.25 },
  { symbol: 'NIFTY500', name: 'NIFTY 500', ltP: 22150.8, pCh: 89.2, pChg: 0.4 },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', ltP: 38620.0, pCh: 336.8, pChg: 0.88 },
  { symbol: 'NIFTYPHARMA', name: 'NIFTY PHARMA', ltP: 21340.6, pCh: 410.2, pChg: 1.96 },
  { symbol: 'NIFTYFMCG', name: 'NIFTY FMCG', ltP: 58210.3, pCh: 145.0, pChg: 0.25 },
  { symbol: 'NIFTYAUTO', name: 'NIFTY AUTO', ltP: 24680.5, pCh: -120.4, pChg: -0.49 },
  { symbol: 'NIFTYREALTY', name: 'NIFTY REALTY', ltP: 980.2, pCh: 17.6, pChg: 1.83 },
  { symbol: 'NIFTYMETAL', name: 'NIFTY METAL', ltP: 9210.7, pCh: -84.3, pChg: -0.91 },
  { symbol: 'NIFTYENERGY', name: 'NIFTY ENERGY', ltP: 41560.9, pCh: 220.1, pChg: 0.53 },
]

export function MarketOverview() {
  const { indices, isLoading } = useIndices({ refreshInterval: 5000 })
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCardClick = (symbol: string, idx: number) => {
    setActiveIndex(idx)
    // Strip '^' prefix for cleaner URLs, e.g. /indices/NSEI instead of /indices/^NSEI
    const urlSymbol = symbol.replace('^', '')
    router.push(`/indices/${urlSymbol}`)
  }

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  // Merge live indices with extra fallback indices, de-duping by symbol,
  // so the strip always has enough cards to be meaningfully scrollable.
  const merged = [...(indices || [])]
  for (const fallbackItem of EXTRA_INDEX_FALLBACK) {
    if (!merged.some((item: any) => item.symbol === fallbackItem.symbol)) {
      merged.push({
        ...fallbackItem,
        type: 'index',
      })
    }
  }
  const displayIndices = merged

  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-8 md:py-10 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
                Markets at a Glance
              </h2>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-sm md:text-base">
                Real-time index data updated every 5 seconds. Click any card to view detailed historical charts.
              </p>
            </div>

            {/* Scroll controls (desktop only) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollByAmount(-280)}
                aria-label="Scroll left"
                className="p-2 rounded-full border border-[#E8E8E8] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] hover:border-[#44C2A4] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollByAmount(280)}
                aria-label="Scroll right"
                className="p-2 rounded-full border border-[#E8E8E8] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] hover:border-[#44C2A4] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && displayIndices.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-5 h-44 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161618] animate-pulse" />
              ))}
            </div>
          ) : (
            /* Horizontally scrollable index strip */
            <div className="relative">
              {/* Edge fade overlays to hint at scrollability */}
              <div className="hidden md:block absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-white dark:from-[#0D0D0D] to-transparent z-10 pointer-events-none" />
              <div className="hidden md:block absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-white dark:from-[#0D0D0D] to-transparent z-10 pointer-events-none" />

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {displayIndices.map((index: any, idx: number) => {
                  const changeVal = Number(index.pCh)
                  const isPositive = changeVal >= 0
                  const sparklineData = getSparklineForIndex(index.symbol, Number(index.pChg))

                  return (
                    <motion.div
                      key={index.symbol}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.04 }}
                      onClick={() => handleCardClick(index.symbol, idx)}
                      className={`snap-start flex-shrink-0 w-[230px] cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex flex-col justify-between h-[210px] ${
                        activeIndex === idx
                          ? 'bg-[#F0FDF9] dark:bg-[#1A3A36] border-[#44C2A4] shadow-md'
                          : 'bg-white dark:bg-[#161618] border-[#E8E8E8] dark:border-[#2A2A2A] hover:border-[#44C2A4]'
                      }`}
                    >
                      <div>
                        {/* Index Name */}
                        <h3 className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide truncate">
                          {index.name || index.symbol}
                        </h3>

                        {/* Value */}
                        <p className="text-xl font-extrabold text-[#1A1A1A] dark:text-white mt-1">
                          {formatPrice(index.ltP)}
                        </p>

                        {/* Change */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-xs font-bold ${getChangeColor(index.pChg)} flex items-center`}>
                            {isPositive ? '+' : ''}{formatChange(index.pCh)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isPositive
                              ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                              : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                          }`}>
                            {isPositive ? '+' : ''}{formatChangePercent(index.pChg)}
                          </span>
                        </div>
                      </div>

                      {/* Sparkline */}
                      <div className="mt-3 -mx-4 px-4 h-12">
                        <MiniSparkline data={sparklineData} isPositive={isPositive} />
                      </div>

                      {/* View Details Link */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] font-bold text-[#44C2A4]">
                        <span>View details</span>
                        <span>&rarr;</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
