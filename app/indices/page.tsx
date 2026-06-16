'use client'

import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useIndices } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor, getBgChangeColor } from '@/lib/utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function IndicesPage() {
  const { indices, isLoading, error } = useIndices()

  const indexCards = [
    { label: 'Open', key: 'open' },
    { label: 'High', key: 'high' },
    { label: 'Low', key: 'low' },
    { label: 'Close', key: 'ltP' },
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
            Market Indices
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Track India's top market indices in real-time
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-6">
            Error loading indices. Please try again.
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {(indices || []).map((index: any) => (
              <div
                key={index.symbol}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1">
                    {index.name || index.symbol}
                  </h2>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {index.symbol}
                  </p>
                </div>

                {/* Price Section */}
                <div className="mb-6 pb-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                  <div className="flex items-end gap-4 mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
                        {formatPrice(index.ltP)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${getBgChangeColor(index.pChg)} px-3 py-1.5 rounded-lg`}>
                      {Number(index.pChg) > 0 ? (
                        <TrendingUp className={`w-4 h-4 ${getChangeColor(index.pChg)}`} />
                      ) : (
                        <TrendingDown className={`w-4 h-4 ${getChangeColor(index.pChg)}`} />
                      )}
                      <span className={`font-semibold ${getChangeColor(index.pChg)}`}>
                        {formatChange(index.pCh)}
                      </span>
                      <span className={`font-semibold text-sm ${getChangeColor(index.pChg)}`}>
                        ({formatChangePercent(index.pChg)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* OHLC Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {indexCards.map((card) => (
                    <div key={card.key}>
                      <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-2">
                        {card.label}
                      </p>
                      <p className="text-lg font-semibold text-[#1A1A1A] dark:text-white">
                        {formatPrice(index[card.key] || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
