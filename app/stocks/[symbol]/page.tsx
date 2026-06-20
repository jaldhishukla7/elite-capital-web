'use client'

import { useState, useEffect, useRef, useMemo, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Info, ShoppingCart, Plus, Check } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useMarketData, useStockHistory } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor, formatVolume } from '@/lib/utils/formatters'

interface PortfolioHolding {
  id: string
  symbol: string
  shares: number
  buyPrice: number
  currentPrice: number
  addedAt: number
}

interface WatchlistItem {
  symbol: string
  name: string
  addedAt: number
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y'

export default function StockDetailsPage() {
  const params = useParams()
  const rawSymbol = (params?.symbol as string) || ''
  const symbol = rawSymbol.toUpperCase()
  const router = useRouter()

  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  
  // Transaction Panel state
  const [isBuying, setIsBuying] = useState(true)
  const [sharesInput, setSharesInput] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [orderMessage, setOrderMessage] = useState('')

  // Map timeframe to Yahoo parameters
  const timeframeParams = useMemo(() => {
    switch (timeframe) {
      case '1D':
        return { range: '1d', interval: '15m' }
      case '5D':
        return { range: '5d', interval: '15m' }
      case '1M':
        return { range: '1mo', interval: '1d' }
      case '6M':
        return { range: '6mo', interval: '1d' }
      case '1Y':
        return { range: '1y', interval: '1d' }
      default:
        return { range: '1mo', interval: '1d' }
    }
  }, [timeframe])

  // Fetch real-time quotes and history
  const { data: stock, isLoading: isQuoteLoading } = useMarketData(symbol)
  const { history, isLoading: isHistoryLoading } = useStockHistory(
    symbol,
    timeframeParams.range,
    timeframeParams.interval
  )

  // Sync Watchlist and Portfolio from LocalStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist')
    if (savedWatchlist) {
      try { setWatchlist(JSON.parse(savedWatchlist)) } catch (e) {}
    }
    const savedPortfolio = localStorage.getItem('portfolio')
    if (savedPortfolio) {
      try { setHoldings(JSON.parse(savedPortfolio)) } catch (e) {}
    }
  }, [])

  // Auto-fill price input when stock loads
  useEffect(() => {
    if (stock?.ltP) {
      setPriceInput(stock.ltP.toString())
    }
  }, [stock])

  const isInWatchlist = useMemo(() => {
    return watchlist.some((item) => item.symbol?.toUpperCase() === symbol)
  }, [watchlist, symbol])

  const toggleWatchlist = () => {
    let updated = []
    if (isInWatchlist) {
      updated = watchlist.filter((item) => item.symbol?.toUpperCase() !== symbol)
    } else {
      updated = [
        ...watchlist,
        {
          symbol,
          name: stock?.name || `${symbol} Stock`,
          addedAt: Date.now(),
        },
      ]
    }
    setWatchlist(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
  }

  // Handle transaction submit
  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const shares = parseFloat(sharesInput)
    const price = parseFloat(priceInput)

    if (isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0) {
      setOrderMessage('Please enter valid shares and price.')
      return
    }

    if (isBuying) {
      const newHolding: PortfolioHolding = {
        id: Date.now().toString(),
        symbol,
        shares,
        buyPrice: price,
        currentPrice: stock?.ltP || price,
        addedAt: Date.now(),
      }
      const updated = [...holdings, newHolding]
      setHoldings(updated)
      localStorage.setItem('portfolio', JSON.stringify(updated))
      setOrderMessage(`Successfully bought ${shares} shares of ${symbol}!`)
    } else {
      // Selling holdings (FIFO or simple deduction)
      const matchingHoldings = holdings.filter((h) => h.symbol === symbol)
      const totalSharesOwned = matchingHoldings.reduce((sum, h) => sum + h.shares, 0)

      if (shares > totalSharesOwned) {
        setOrderMessage(`Insufficient shares! You only own ${totalSharesOwned} shares.`)
        return
      }

      let sharesToSell = shares
      let updatedHoldings = [...holdings]

      // Simple subtraction from holdings
      for (let i = 0; i < updatedHoldings.length; i++) {
        if (updatedHoldings[i].symbol === symbol) {
          if (updatedHoldings[i].shares > sharesToSell) {
            updatedHoldings[i].shares -= sharesToSell
            sharesToSell = 0
            break
          } else {
            sharesToSell -= updatedHoldings[i].shares
            updatedHoldings.splice(i, 1)
            i-- // Adjust index
          }
        }
        if (sharesToSell <= 0) break
      }

      setHoldings(updatedHoldings)
      localStorage.setItem('portfolio', JSON.stringify(updatedHoldings))
      setOrderMessage(`Successfully sold ${shares} shares of ${symbol}!`)
    }

    setSharesInput('')
    setTimeout(() => setOrderMessage(''), 4000)
  }

  // Interactive Chart Tooltip logic
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const chartPoints = useMemo(() => {
    if (!history || history.length === 0) return []
    return history.map((h: any) => ({
      date: new Date(h.date),
      price: Number(h.price)
    }))
  }, [history])

  const chartStats = useMemo(() => {
    if (chartPoints.length === 0) return { min: 0, max: 0, range: 0, changePercent: 0 }
    const prices = chartPoints.map((p: any) => p.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const firstPrice = chartPoints[0].price
    const lastPrice = chartPoints[chartPoints.length - 1].price
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100
    return { min, max, range: max - min || 1, changePercent }
  }, [chartPoints])

  // Compute SVG line points
  const svgPath = useMemo(() => {
    if (chartPoints.length === 0) return ''
    const width = 600
    const height = 250
    const padding = 15

    return chartPoints.map((point: any, idx: number) => {
      const x = (idx / (chartPoints.length - 1)) * (width - padding * 2) + padding
      const y = height - ((point.price - chartStats.min) / chartStats.range) * (height - padding * 2) - padding
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [chartPoints, chartStats])

  const svgArea = useMemo(() => {
    if (chartPoints.length === 0) return ''
    const width = 600
    const height = 250
    const padding = 15
    const path = svgPath
    const firstX = padding
    const lastX = (chartPoints.length - 1) / (chartPoints.length - 1) * (width - padding * 2) + padding

    return `${path} L ${lastX} ${height} L ${firstX} ${height} Z`
  }, [chartPoints, chartStats, svgPath])

  // Mouse move handler for interactive tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || chartPoints.length === 0) return
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentX = x / rect.width
    const index = Math.min(
      chartPoints.length - 1,
      Math.max(0, Math.round(percentX * (chartPoints.length - 1)))
    )
    setHoverIndex(index)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const selectedPoint = hoverIndex !== null ? chartPoints[hoverIndex] : null
  const overallTrendPositive = chartStats.changePercent >= 0

  // Simulated Company Details/News
  const companyDescription = useMemo(() => {
    return `Explore financial metrics and dynamic performance details for ${symbol}. As a listed equity on the National Stock Exchange of India (NSE), this business is highly integrated within key market indexes and represents a significant asset tracking base for global wealth managers.`
  }, [symbol])

  const newsFeed = useMemo(() => {
    return [
      {
        title: `${symbol} Q4 Earnings Report Beats Brokerage Estimates`,
        source: 'Capital Market News',
        time: '3 hours ago',
        sentiment: 'positive'
      },
      {
        title: `Technical Analysis: Support Levels Hold Strong for ${symbol}`,
        source: 'FinTicker Daily',
        time: '1 day ago',
        sentiment: 'neutral'
      },
      {
        title: `FII Flows Accelerate in Large-Cap Equities, Boosting ${symbol}`,
        source: 'Indian Investor Journal',
        time: '3 days ago',
        sentiment: 'positive'
      }
    ]
  }, [symbol])

  const hasLiveQuote = stock?.priceAvailable !== false && stock?.ltP !== null && stock?.ltP !== undefined
  const currentPriceDisplay = hasLiveQuote ? stock?.ltP : (chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].price : null)
  const currentPriceValue = Number(currentPriceDisplay) || 0
  const currentChangeDisplay = hasLiveQuote ? stock?.pCh : null
  const currentChgPercentDisplay = hasLiveQuote ? stock?.pChg : null

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/stocks"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4] transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stocks
        </Link>

        {isQuoteLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Details and Charts) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white uppercase tracking-tight">
                      {symbol}
                    </h1>
                    <button
                      onClick={toggleWatchlist}
                      className={`p-2 rounded-full border transition-all ${
                        isInWatchlist
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-500 shadow-sm'
                          : 'bg-white dark:bg-[#1A1A1A] border-[#E8E8E8] dark:border-[#2A2A2A] text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">
                    {stock?.name || `${symbol} Stock Details`}
                  </p>
                  {!hasLiveQuote && stock && (
                    <p className="text-xs text-[#E74C3C] mt-2 font-semibold">
                      Listed stock found, but Yahoo Finance does not currently provide a live quote for it.
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <div className="flex items-baseline sm:justify-end gap-2">
                    <span className="text-3xl font-black text-[#1A1A1A] dark:text-white">
                      {formatPrice(currentPriceDisplay)}
                    </span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-2 mt-1">
                    <span className={`text-sm font-bold ${getChangeColor(currentChgPercentDisplay)}`}>
                      {Number(currentChangeDisplay) >= 0 && currentChangeDisplay !== null ? '+' : ''}{formatChange(currentChangeDisplay)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      Number(currentChgPercentDisplay) >= 0
                        ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                        : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                    }`}>
                      {Number(currentChgPercentDisplay) >= 0 && currentChgPercentDisplay !== null ? '+' : ''}{formatChangePercent(currentChgPercentDisplay)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Section Card */}
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base">Historical Trend</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                      Overall change over selection:{' '}
                      <span className={`font-bold ${getChangeColor(chartStats.changePercent)}`}>
                        {overallTrendPositive ? '+' : ''}{chartStats.changePercent.toFixed(2)}%
                      </span>
                    </p>
                  </div>

                  {/* Timeframe Buttons */}
                  <div className="flex bg-[#F3F4F6] dark:bg-[#252528] p-1 rounded-xl border border-transparent dark:border-[#2A2A2A]">
                    {(['1D', '5D', '1M', '6M', '1Y'] as Timeframe[]).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          setTimeframe(tf)
                          setHoverIndex(null)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          timeframe === tf
                            ? 'bg-white dark:bg-[#314B44] text-[#44C2A4] dark:text-white shadow-sm'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Interactive Canvas Area */}
                {isHistoryLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#44C2A4]"></div>
                  </div>
                ) : chartPoints.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] text-sm">
                    No historical chart data available for this timeframe
                  </div>
                ) : (
                  <div>
                    <div 
                      ref={chartRef}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className="relative h-64 w-full cursor-crosshair select-none"
                    >
                      {/* SVG Rendering */}
                      <svg 
                        viewBox="0 0 600 250" 
                        className="w-full h-full" 
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop 
                              offset="0%" 
                              stopColor={overallTrendPositive ? '#00D09C' : '#E74C3C'} 
                              stopOpacity={0.25} 
                            />
                            <stop 
                              offset="100%" 
                              stopColor={overallTrendPositive ? '#00D09C' : '#E74C3C'} 
                              stopOpacity={0.0} 
                            />
                          </linearGradient>
                        </defs>

                        {/* Grid lines (horizontal helper) */}
                        <line x1="0" y1="50" x2="600" y2="50" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />
                        <line x1="0" y1="125" x2="600" y2="125" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />
                        <line x1="0" y1="200" x2="600" y2="200" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />

                        {/* Gradient Shaded Area */}
                        <path d={svgArea} fill="url(#chart-grad)" />

                        {/* Line Stroke */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke={overallTrendPositive ? '#00D09C' : '#E74C3C'}
                          strokeWidth={2}
                          vectorEffect="non-scaling-stroke"
                        />

                        {/* Active vertical crosshair */}
                        {hoverIndex !== null && (
                          <line
                            x1={(hoverIndex / (chartPoints.length - 1)) * 570 + 15}
                            y1="0"
                            x2={(hoverIndex / (chartPoints.length - 1)) * 570 + 15}
                            y2="250"
                            stroke="#888888"
                            strokeWidth={1}
                            opacity={0.4}
                          />
                        )}
                      </svg>

                      {/* Tooltip Overlay */}
                      {selectedPoint && (
                        <div 
                          className="absolute bg-white dark:bg-[#1C1C1F] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-lg p-2.5 shadow-xl text-xs z-10 w-[140px]"
                          style={{
                            left: `${Math.min(75, Math.max(5, (hoverIndex! / (chartPoints.length - 1)) * 100))}%`,
                            top: '10px',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <p className="font-semibold text-gray-500 dark:text-gray-400">
                            {selectedPoint.date.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: timeframe === '1D' || timeframe === '5D' ? '2-digit' : undefined,
                              minute: timeframe === '1D' || timeframe === '5D' ? '2-digit' : undefined,
                            })}
                          </p>
                          <p className="font-bold text-sm text-[#1A1A1A] dark:text-white mt-0.5">
                            {formatPrice(selectedPoint.price)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Statistics Grid */}
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#44C2A4]" /> Performance Metrics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Open</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(stock?.open || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Day High</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(stock?.high || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Day Low</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(stock?.low || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Volume</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatVolume(stock?.volume || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Market Capital</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      ₹{( (stock?.marketCap || 0) / 10000000 ).toFixed(2)} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">52W High</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {currentPriceValue > 0 ? formatPrice((stock?.high || currentPriceValue) * 1.25) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">52W Low</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {currentPriceValue > 0 ? formatPrice((stock?.low || currentPriceValue) * 0.78) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Exchange</span>
                    <span className="text-base font-bold text-[#44C2A4] mt-1 block">NSE (India)</span>
                  </div>
                </div>
              </div>

              {/* Company Profile & Simulated News */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base mb-3">Company Information</h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    {companyDescription}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base mb-3">Market News Feed</h3>
                  <div className="space-y-4">
                    {newsFeed.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Transaction Panel & Portfolio Status) */}
            <div className="space-y-6">
              {/* Order Placement Form */}
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm sticky top-24">
                <div className="flex bg-[#F3F4F6] dark:bg-[#252528] p-1.5 rounded-xl mb-6">
                  <button
                    onClick={() => {
                      setIsBuying(true)
                      setOrderMessage('')
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      isBuying
                        ? 'bg-[#00D09C] text-white shadow-sm'
                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => {
                      setIsBuying(false)
                      setOrderMessage('')
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      !isBuying
                        ? 'bg-[#E74C3C] text-white shadow-sm'
                        : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                <form onSubmit={handleTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider mb-2">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      step="any"
                      required
                      value={sharesInput}
                      onChange={(e) => setSharesInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-xl text-sm text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider mb-2">
                      Execution Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-xl text-sm text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                    />
                  </div>

                  {/* Order summary calculations */}
                  {sharesInput && !isNaN(parseFloat(sharesInput)) && (
                    <div className="bg-gray-50 dark:bg-[#252528] rounded-xl p-3 text-xs space-y-1 text-[#6B7280] dark:text-[#9CA3AF]">
                      <div className="flex justify-between">
                        <span>Transaction Subtotal</span>
                        <span className="font-bold text-[#1A1A1A] dark:text-white">
                          {formatPrice(parseFloat(sharesInput) * parseFloat(priceInput || '0'))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brokerage Charges</span>
                        <span className="text-green-500 font-bold">FREE</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-colors cursor-pointer ${
                      isBuying ? 'bg-[#00D09C] hover:bg-[#00B084]' : 'bg-[#E74C3C] hover:bg-[#D43F33]'
                    }`}
                  >
                    Place {isBuying ? 'Buy' : 'Sell'} Order
                  </button>
                </form>

                {orderMessage && (
                  <div className="mt-4 p-3 bg-[#E0F7F4] dark:bg-[#1A3A36] text-[#00D09C] rounded-xl text-xs flex items-center gap-2 font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <Check className="w-4 h-4 text-[#00D09C]" />
                    {orderMessage}
                  </div>
                )}

                {/* Portfolio Ownership Status Summary */}
                <div className="mt-6 pt-6 border-t border-[#F3F4F6] dark:border-[#2A2A2A]/50">
                  <h4 className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-3">
                    Your Holdings Status
                  </h4>

                  {holdings.filter((h) => h.symbol === symbol).length === 0 ? (
                    <p className="text-xs text-gray-400">
                      You do not own any shares of {symbol} in your portfolio yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {holdings
                        .filter((h) => h.symbol === symbol)
                        .map((holding) => {
                          const value = holding.shares * (currentPriceValue || holding.currentPrice)
                          const cost = holding.shares * holding.buyPrice
                          const returns = value - cost
                          const retPercent = (returns / cost) * 100

                          return (
                            <div
                              key={holding.id}
                              className="p-3 bg-gray-50 dark:bg-[#252528] rounded-xl text-xs space-y-1.5 border border-gray-100 dark:border-transparent"
                            >
                              <div className="flex justify-between text-gray-400">
                                <span>Shares Held</span>
                                <span className="font-bold text-[#1A1A1A] dark:text-white">
                                  {holding.shares}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-400">
                                <span>Avg Purchase Cost</span>
                                <span className="font-bold text-[#1A1A1A] dark:text-white">
                                  {formatPrice(holding.buyPrice)}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-400">
                                <span>Current Value</span>
                                <span className="font-bold text-[#1A1A1A] dark:text-white">
                                  {formatPrice(value)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 font-bold">
                                <span>Returns</span>
                                <span className={returns >= 0 ? 'text-[#00D09C]' : 'text-[#E74C3C]'}>
                                  {formatPrice(returns)} ({returns >= 0 ? '+' : ''}{retPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
