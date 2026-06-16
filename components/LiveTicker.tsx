'use client'

import { motion } from 'framer-motion'
import { useIndices } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor } from '@/lib/utils/formatters'

interface MarketData {
  name: string
  symbol: string
  ltP: number | string
  pCh: number | string
  pChg: number | string
}

export function LiveTicker() {
  const { indices, isLoading } = useIndices({ refreshInterval: 5000 })

  // Format indices data for display
  const tickerData: MarketData[] = (indices || []).map((index: any) => ({
    name: index.name || index.symbol,
    symbol: index.symbol,
    ltP: index.ltP || 0,
    pCh: index.pCh || 0,
    pChg: index.pChg || 0,
  }))

  // Use fallback data if loading
  const displayData = isLoading && tickerData.length === 0 ? [
    { name: 'NIFTY 50', symbol: '^NSEI', ltP: 23487.50, pCh: 125.40, pChg: 0.54 },
    { name: 'SENSEX', symbol: '^BSESN', ltP: 77123.45, pCh: 312.50, pChg: 0.41 },
    { name: 'NIFTY JR 50', symbol: 'NIFTYJUNIOR', ltP: 8945.30, pCh: 45.60, pChg: 0.51 },
    { name: 'NIFTY MIDCAP 150', symbol: 'NIFTYMIDCAP150', ltP: 12567.45, pCh: 78.90, pChg: 0.63 },
    { name: 'NIFTY 500', symbol: 'NIFTY500', ltP: 15623.80, pCh: 89.20, pChg: 0.57 },
  ] : tickerData

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#F0FDF9] to-[#F0FDF9] border-b border-[#E8E8E8] dark:from-[#1A1A1A] dark:to-[#1A1A1A] dark:border-[#2A2A2A]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">
            LIVE MARKET
          </span>
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
        </div>

        {/* Scrolling ticker container */}
        <div className="flex-1 overflow-hidden mx-4">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: [0, -2000] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* First set */}
            {displayData.map((item, idx) => (
              <div key={`${idx}-1`} className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-white min-w-fit">
                  {formatPrice(item.ltP)}
                </span>
                <span className={`text-sm font-semibold min-w-fit ${getChangeColor(item.pCh)}`}>
                  {formatChange(item.pCh)}
                </span>
                <span
                  className={`text-xs font-medium min-w-fit px-2 py-1 rounded-full ${
                    Number(item.pChg) > 0
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36] dark:text-[#00D09C]'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A] dark:text-[#E74C3C]'
                  }`}
                >
                  {formatChangePercent(item.pChg)}
                </span>
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {displayData.map((item, idx) => (
              <div key={`${idx}-2`} className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-white min-w-fit">
                  {formatPrice(item.ltP)}
                </span>
                <span className={`text-sm font-semibold min-w-fit ${getChangeColor(item.pCh)}`}>
                  {formatChange(item.pCh)}
                </span>
                <span
                  className={`text-xs font-medium min-w-fit px-2 py-1 rounded-full ${
                    Number(item.pChg) > 0
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36] dark:text-[#00D09C]'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A] dark:text-[#E74C3C]'
                  }`}
                >
                  {formatChangePercent(item.pChg)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Loading status */}
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF] dark:text-[#6B7280] whitespace-nowrap">
          <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Live'}</span>
        </div>
      </div>
    </div>
  )
}
