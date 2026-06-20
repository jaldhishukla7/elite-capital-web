'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor, formatVolume } from '@/lib/utils/formatters'

export default function StocksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [exchange, setExchange] = useState<'all' | 'NSE' | 'BSE'>('all')
  const { stocks, count, totalPages, isLoading, error } = useStocks(25, {
    page,
    query: debouncedSearch,
    exchange,
    refreshInterval: 10000,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchTerm])

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
            Search listed Indian equities and fetch live quotes for the visible rows
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {(['all', 'NSE', 'BSE'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setExchange(item)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    exchange === item
                      ? 'bg-[#44C2A4] text-white'
                      : 'bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white hover:bg-[#E8E8E8] dark:hover:bg-[#3A3A3A]'
                  }`}
                >
                  {item === 'all' ? 'All' : item}
                </button>
              ))}
            </div>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              {count.toLocaleString('en-IN')} stocks found
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-[#F8FAFC] dark:bg-[#161618] px-4 py-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          Prices come from Yahoo Finance where available. Some newly listed, SME, or less-traded BSE/NSE stocks may appear in search before a live quote is available.
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
          <>
            <div className="grid gap-3 md:gap-4">
              {stocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#6B7280] dark:text-[#9CA3AF]">No stocks found</p>
                </div>
              ) : (
                stocks.map((stock: any) => (
                  <Link
                    key={`${stock.exchange}-${stock.symbol}`}
                    href={`/stocks/${stock.symbol}`}
                    className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#1A1A1A] dark:text-white">
                            {stock.symbol}
                          </h3>
                          <span className="rounded bg-[#F3F4F6] dark:bg-[#2A2A2A] px-2 py-0.5 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                            {stock.exchange}
                          </span>
                          {stock.bseCode && (
                            <span className="text-xs text-[#9CA3AF]">
                              BSE {stock.bseCode}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          {stock.name}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          ISIN: {stock.isin || 'N/A'}
                          {stock.priceAvailable ? ` | Vol: ${formatVolume(stock.volume)}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 md:gap-6 text-right">
                        {stock.priceAvailable ? (
                          <>
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
                                Number(stock.pChg) >= 0
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {Number(stock.pChg) >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {formatChangePercent(stock.pChg)}
                            </div>
                          </>
                        ) : (
                          <div className="min-w-[128px] rounded-lg bg-[#F3F4F6] dark:bg-[#252528] px-3 py-2 text-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                            Quote unavailable
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
