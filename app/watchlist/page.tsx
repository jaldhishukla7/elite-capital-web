'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { Heart, X, Plus } from 'lucide-react'
import { useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor } from '@/lib/utils/formatters'

interface WatchlistItem {
  symbol: string
  name: string
  addedAt: number
}

export default function WatchlistPage() {
  const { stocks, isLoading } = useStocks(100)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [showAddInput, setShowAddInput] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchlist')
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (e) {
        setWatchlist([])
      }
    }
  }, [])

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const handleAddToWatchlist = (symbol: string, name: string) => {
    if (!watchlist.find((item) => item.symbol === symbol)) {
      setWatchlist([...watchlist, { symbol, name, addedAt: Date.now() }])
    }
  }

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((item) => item.symbol !== symbol))
  }

  const handleAddCustom = () => {
    if (inputValue.trim()) {
      const stock = stocks?.find(
        (s: any) => s.symbol?.toUpperCase() === inputValue.toUpperCase()
      )
      if (stock) {
        handleAddToWatchlist(stock.symbol, stock.name)
        setInputValue('')
        setShowAddInput(false)
      }
    }
  }

  const watchlistStocks = (stocks || []).filter((stock: any) =>
    watchlist.some((item) => item.symbol === stock.symbol)
  )

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
              My Watchlist
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Track your favorite stocks and indices
            </p>
          </div>
          <button
            onClick={() => setShowAddInput(!showAddInput)}
            className="flex items-center gap-2 px-4 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Stock</span>
          </button>
        </div>

        {/* Add Stock Input */}
        {showAddInput && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg flex gap-2">
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., INFY, TCS)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
              className="flex-1 px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddInput(false)
                setInputValue('')
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-[#1A1A1A] dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-[#E8E8E8] dark:text-[#2A2A2A] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
              Start adding stocks to keep track of your favorite investments
            </p>
            <button
              onClick={() => setShowAddInput(true)}
              className="px-6 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
            >
              Add Your First Stock
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
              </div>
            ) : (
              watchlistStocks.map((stock: any) => (
                <div
                  key={stock.symbol}
                  className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A] dark:text-white">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {stock.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-[#1A1A1A] dark:text-white">
                        {formatPrice(stock.ltP)}
                      </p>
                      <p className={`text-sm font-medium ${getChangeColor(stock.pCh)}`}>
                        {formatChange(stock.pCh)}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                        Number(stock.pChg) > 0
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {formatChangePercent(stock.pChg)}
                    </div>

                    <button
                      onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
