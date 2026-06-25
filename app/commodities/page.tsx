'use client'

import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useCommodities } from '@/lib/hooks/useMarketData'
import { formatChange, formatChangePercent, getChangeColor, getBgChangeColor } from '@/lib/utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function CommoditiesPage() {
  const { commodities, isLoading, error } = useCommodities()

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
            Commodities Market
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Real-time commodity prices including gold, silver, oil, and more
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg mb-6">
            Error loading commodities. Please try again.
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(commodities || []).map((commodity: any) => (
              <div
                key={commodity.symbol}
                className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-1">
                    {commodity.name}
                  </h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {commodity.symbol}
                  </p>
                </div>

                {/* Price Section */}
                <div className="mb-4 pb-4 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                      {commodity.unit}
                    </span>
                    <span className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                      {typeof commodity.price === 'number' 
                        ? commodity.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                        : commodity.price
                      }
                    </span>
                  </div>
                </div>

                {/* Change Section */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Change</p>
                    <p className={`font-semibold ${getChangeColor(commodity.change)}`}>
                      {formatChange(commodity.change)}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${getBgChangeColor(commodity.changePercent)}`}
                  >
                    {Number(commodity.changePercent) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold text-sm">
                      {formatChangePercent(commodity.changePercent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
