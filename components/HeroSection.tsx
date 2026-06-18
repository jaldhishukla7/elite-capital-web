'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice } from '@/lib/utils/formatters'

interface PortfolioHolding {
  id: string
  symbol: string
  shares: number
  buyPrice: number
  currentPrice: number
}

export function HeroSection() {
  const router = useRouter()
  const { stocks } = useStocks(50)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio')
    if (saved) {
      try {
        setHoldings(JSON.parse(saved))
      } catch (e) {
        // Fallback
      }
    }
  }, [])

  // Calculate dynamic stats
  let totalInvestment = 0
  let totalCurrentValue = 0
  let bestPerformerSymbol = 'RELIANCE'
  let bestPerformerGain = 1.56

  if (holdings.length > 0) {
    // We have user holdings. Match them with live stocks data
    let maxHoldingGain = -Infinity
    holdings.forEach((holding) => {
      const liveStock = (stocks || []).find(
        (s: any) => s.symbol?.toUpperCase() === holding.symbol?.toUpperCase()
      )
      const currentPrice = liveStock ? Number(liveStock.ltP) : holding.buyPrice
      
      totalInvestment += holding.buyPrice * holding.shares
      totalCurrentValue += currentPrice * holding.shares

      const gainPercent = ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100
      if (gainPercent > maxHoldingGain) {
        maxHoldingGain = gainPercent
        bestPerformerSymbol = holding.symbol
        bestPerformerGain = gainPercent
      }
    })
  } else {
    // No user holdings. Generate a realistic demo portfolio dynamic with market trends
    totalInvestment = 450000
    
    // Sum index changes or use live stock trends
    const avgChangePercent = (stocks || []).reduce((acc: number, s: any) => acc + (Number(s.pChg) || 0), 0) / ((stocks || []).length || 1)
    
    bestPerformerSymbol = 'RELIANCE'
    bestPerformerGain = 1.2

    if (stocks && stocks.length > 0) {
      const sorted = [...stocks].sort((a: any, b: any) => Number(b.pChg) - Number(a.pChg))
      if (sorted[0]) {
        bestPerformerSymbol = sorted[0].symbol
        bestPerformerGain = Number(sorted[0].pChg)
      }
      totalCurrentValue = totalInvestment * (1 + avgChangePercent / 100)
    } else {
      totalCurrentValue = 450234.50
      bestPerformerSymbol = 'RELIANCE'
      bestPerformerGain = 12.5
    }
  }

  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0
  const isPositive = totalGainLoss >= 0

  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white leading-tight">
              Invest in Stocks & Mutual Funds
            </h1>
            <p className="text-lg text-[#44C2A4] font-semibold">
              The smarter way to grow your wealth
            </p>
            <p className="text-base text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
              Live market data, real-time charts, watchlist trackers, mutual fund NAVs — everything you need to make informed investment decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/stocks">
                <button className="w-full sm:w-auto px-6 py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  Explore Stocks <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/watchlist">
                <button className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-[#44C2A4] text-[#44C2A4] font-semibold rounded-full hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  View Watchlist <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right side - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-[#F9F9F9] dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#E8E8E8] dark:border-[#2A2A2A] shadow-lg">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#6B7280] dark:text-[#9CA3AF] font-semibold">
                      {holdings.length > 0 ? 'My Portfolio Value' : 'Demo Portfolio Overview'}
                    </p>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mt-2">
                      {formatPrice(totalCurrentValue)}
                    </h2>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-3 border border-[#E8E8E8] dark:border-[#2A2A2A]">
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-0.5">Total Returns</p>
                      <p className={`text-lg font-bold ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                        {isPositive ? '+' : ''}{formatPrice(totalGainLoss)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-3 border border-[#E8E8E8] dark:border-[#2A2A2A]">
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-0.5">Return %</p>
                      <p className={`text-lg font-bold ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                        {isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Mini chart area */}
                  <div className="h-24 bg-gradient-to-b from-[#E0F7F4] to-transparent dark:from-[#1A3A36]/40 dark:to-transparent rounded-lg flex items-end justify-around p-3">
                    {holdings.length > 0 ? (
                      // Display dynamic bar heights based on holdings purchase ratios
                      holdings.slice(0, 7).map((holding, i) => {
                        const ratio = Math.min(1.0, Math.max(0.2, (holding.shares * holding.currentPrice) / totalCurrentValue))
                        return (
                          <div
                            key={holding.id}
                            className="w-2.5 bg-[#44C2A4] rounded-t transition-all duration-500"
                            style={{ height: `${ratio * 100}%` }}
                            title={holding.symbol}
                          />
                        )
                      })
                    ) : (
                      // Standard spark chart fallback
                      [0.3, 0.45, 0.4, 0.55, 0.7, 0.65, 0.85, 0.75, 1.0].map((height, i) => (
                        <div
                          key={i}
                          className="w-2 bg-[#44C2A4] rounded-t"
                          style={{ height: `${height * 100}%` }}
                        />
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <Link href="/portfolio" className="block text-center">
                    <span className="w-full inline-block py-2 text-sm font-semibold text-[#44C2A4] hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] rounded-lg transition-colors border border-transparent hover:border-[#44C2A4]/20">
                      View Full Portfolio &rarr;
                    </span>
                  </Link>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 bg-white dark:bg-[#1A1A1A] rounded-xl p-4 shadow-lg border border-[#E8E8E8] dark:border-[#2A2A2A] w-40 cursor-pointer"
                onClick={() => router.push(`/stocks/${bestPerformerSymbol}`)}
              >
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Best Performer</p>
                <p className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase truncate">{bestPerformerSymbol}</p>
                <p className={`text-lg font-bold ${bestPerformerGain >= 0 ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                  {bestPerformerGain >= 0 ? '+' : ''}{bestPerformerGain.toFixed(2)}%
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
