'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor, formatVolume } from '@/lib/utils/formatters'

export default function StocksPage() {
  const { stocks, isLoading, error } = useStocks(100)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'change' | 'price'>('change')

  const filteredStocks = (stocks || [])
    .filter(
      (stock: any) =>
        stock.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortBy === 'change') {
        return Number(b.pChg) - Number(a.pChg)
      } else if (sortBy === 'price') {
        return Number(b.ltP) - Number(a.ltP)
      }
      return a.name.localeCompare(b.name)
    })

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
            Market Stocks
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Explore real-time stock prices from NSE
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-5 h-5" />
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg text-[#1A1A1A] dark:text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
            />
          </div>

          <div className="flex gap-2">
            {(['name', 'change', 'price'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === sort
                    ? 'bg-[#44C2A4] text-white'
                    : 'bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white hover:bg-[#E8E8E8] dark:hover:bg-[#3A3A3A]'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stocks List */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading stocks. Please try again.
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {filteredStocks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">No stocks found</p>
              </div>
            ) : (
              filteredStocks.map((stock: any) => (
                <Link
                  href={`/stocks/${stock.symbol}`}
                  key={stock.symbol}
                  className="block p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg hover:shadow-md transition-all hover:border-[#44C2A4] dark:hover:border-[#44C2A4] cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#1A1A1A] dark:text-white hover:text-[#44C2A4] transition-colors">
                          {stock.symbol}
                        </h3>
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-md block">
                          {stock.name}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        Vol: {formatVolume(stock.volume)} | Market Cap: {stock.marketCap ? `₹${(stock.marketCap / 10000000).toFixed(2)} Cr` : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 text-right flex-shrink-0">
                      <div>
                        <p className="font-semibold text-[#1A1A1A] dark:text-white">
                          {formatPrice(stock.ltP)}
                        </p>
                        <p className={`text-sm font-medium ${getChangeColor(stock.pCh)}`}>
                          {formatChange(stock.pCh)}
                        </p>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-1 min-w-fit ${
                          Number(stock.pChg) > 0
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {Number(stock.pChg) > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatChangePercent(stock.pChg)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
