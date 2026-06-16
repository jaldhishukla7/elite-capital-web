'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { Plus, Trash2 } from 'lucide-react'
import { formatPrice, formatChange } from '@/lib/utils/formatters'

interface PortfolioHolding {
  id: string
  symbol: string
  shares: number
  buyPrice: number
  currentPrice: number
  addedAt: number
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    buyPrice: '',
  })

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio')
    if (saved) {
      try {
        setHoldings(JSON.parse(saved))
      } catch (e) {
        setHoldings([])
      }
    }
  }, [])

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(holdings))
  }, [holdings])

  // Simulate price updates
  useEffect(() => {
    const timer = setInterval(() => {
      setHoldings((prev) =>
        prev.map((holding) => ({
          ...holding,
          currentPrice: holding.buyPrice * (1 + (Math.random() - 0.5) * 0.05),
        }))
      )
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.symbol && formData.shares && formData.buyPrice) {
      const newHolding: PortfolioHolding = {
        id: Date.now().toString(),
        symbol: formData.symbol.toUpperCase(),
        shares: parseFloat(formData.shares),
        buyPrice: parseFloat(formData.buyPrice),
        currentPrice: parseFloat(formData.buyPrice),
        addedAt: Date.now(),
      }
      setHoldings([...holdings, newHolding])
      setFormData({ symbol: '', shares: '', buyPrice: '' })
      setShowAddForm(false)
    }
  }

  const handleRemoveHolding = (id: string) => {
    setHoldings(holdings.filter((holding) => holding.id !== id))
  }

  const totalInvestment = holdings.reduce((acc, h) => acc + h.buyPrice * h.shares, 0)
  const totalCurrentValue = holdings.reduce((acc, h) => acc + h.currentPrice * h.shares, 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
              My Portfolio
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Manage and track your investments
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Holding</span>
          </button>
        </div>

        {/* Portfolio Summary */}
        {holdings.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">Total Investment</p>
              <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                {formatPrice(totalInvestment)}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">Current Value</p>
              <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                {formatPrice(totalCurrentValue)}
              </p>
            </div>

            <div className={`p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg`}>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">Gain/Loss</p>
              <p
                className={`text-2xl font-bold ${
                  totalGainLoss >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatPrice(totalGainLoss)}
              </p>
            </div>

            <div className={`p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg`}>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">Return %</p>
              <p
                className={`text-2xl font-bold ${
                  totalGainLossPercent >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Add Holding Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg">
            <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4">
              Add New Holding
            </h3>
            <form onSubmit={handleAddHolding} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., INFY"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1">
                    Shares
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    step="0.01"
                    value={formData.shares}
                    onChange={(e) =>
                      setFormData({ ...formData, shares: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1">
                    Buy Price
                  </label>
                  <input
                    type="number"
                    placeholder="1500"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, buyPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
                >
                  Add Holding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ symbol: '', shares: '', buyPrice: '' })
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-[#1A1A1A] dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Holdings List */}
        {holdings.length === 0 ? (
          <div className="text-center py-16">
            <Plus className="w-16 h-16 text-[#E8E8E8] dark:text-[#2A2A2A] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-white mb-2">
              No holdings yet
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">
              Start building your portfolio by adding your first investment
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
            >
              Add Your First Holding
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding) => {
              const gainLoss = holding.currentPrice * holding.shares - holding.buyPrice * holding.shares
              const gainLossPercent = ((holding.currentPrice - holding.buyPrice) / holding.buyPrice) * 100

              return (
                <div
                  key={holding.id}
                  className="p-4 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-bold text-[#1A1A1A] dark:text-white text-lg">
                        {holding.symbol}
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        {holding.shares} shares @ {formatPrice(holding.buyPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                        Current Price
                      </p>
                      <p className="font-semibold text-[#1A1A1A] dark:text-white">
                        {formatPrice(holding.currentPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">
                        Current Value
                      </p>
                      <p className="font-semibold text-[#1A1A1A] dark:text-white">
                        {formatPrice(holding.currentPrice * holding.shares)}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-lg font-semibold text-sm text-right ${
                        gainLoss >= 0
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <p>{formatPrice(gainLoss)}</p>
                      <p>({gainLossPercent.toFixed(2)}%)</p>
                    </div>

                    <button
                      onClick={() => handleRemoveHolding(holding.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
