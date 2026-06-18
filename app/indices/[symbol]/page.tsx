'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Info, BarChart3 } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useMarketData, useStockHistory, useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChange, formatChangePercent, getChangeColor } from '@/lib/utils/formatters'

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y'

export default function IndexDetailsPage() {
  const params = useParams()
  const rawSymbol = (params?.symbol as string) || ''
  const symbol = rawSymbol.toUpperCase()
  const router = useRouter()

  const [timeframe, setTimeframe] = useState<Timeframe>('1M')

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

  // Get index data and history
  // Since symbols might be NSEI, BSESN, NSEBANK, we map them back to ^NSEI, ^BSESN, ^NSEBANK if needed
  const apiSymbol = useMemo(() => {
    if (['NSEI', 'BSESN', 'NSEBANK', 'NSEMD150', 'NSEI500'].includes(symbol)) {
      return `^${symbol}`
    }
    return symbol
  }, [symbol])

  const { data: indexQuote, isLoading: isQuoteLoading } = useMarketData(apiSymbol)
  const { history, isLoading: isHistoryLoading } = useStockHistory(
    apiSymbol,
    timeframeParams.range,
    timeframeParams.interval
  )

  // Fetch stocks to list constituents
  const { stocks } = useStocks(50)

  // Determine index constituent stocks dynamically based on symbol
  const constituents = useMemo(() => {
    if (!stocks || stocks.length === 0) return []

    if (apiSymbol === '^NSEBANK') {
      return stocks.filter((s: any) =>
        ['HDFCBANK', 'ICICIBANK', 'SBI', 'KOTAKBANK', 'AXISBANK'].includes(s.symbol)
      )
    }

    if (apiSymbol === '^NSEI' || apiSymbol === '^BSESN') {
      return stocks.filter((s: any) =>
        ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBI', 'L&T', 'ITC', 'BHARTIARTL', 'ASIANPAINT'].includes(s.symbol)
      )
    }

    // Fallback constituent list
    return stocks.slice(0, 8)
  }, [stocks, apiSymbol])

  // Chart Tooltip logic
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

  const indexNameDisplay = useMemo(() => {
    if (apiSymbol === '^NSEI') return 'NIFTY 50'
    if (apiSymbol === '^BSESN') return 'SENSEX'
    if (apiSymbol === '^NSEBANK') return 'NIFTY BANK'
    if (apiSymbol === 'NIFTYJUNIOR') return 'NIFTY JR 50'
    if (apiSymbol === 'NIFTYMIDCAP150' || apiSymbol === '^NSEMD150') return 'NIFTY MIDCAP 150'
    if (apiSymbol === 'NIFTY500' || apiSymbol === '^NSEI500') return 'NIFTY 500'
    return symbol
  }, [apiSymbol, symbol])

  const currentPriceDisplay = indexQuote?.ltP || (chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].price : 0)
  const currentChangeDisplay = indexQuote?.pCh || 0
  const currentChgPercentDisplay = indexQuote?.pChg || 0

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/indices"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4] transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Indices
        </Link>

        {isQuoteLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#44C2A4]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Chart and Details) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white uppercase tracking-tight">
                    {indexNameDisplay}
                  </h1>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">
                    Index symbol: {apiSymbol}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1A1A1A] dark:text-white">
                      {formatPrice(currentPriceDisplay)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${getChangeColor(currentChgPercentDisplay)}`}>
                      {currentChangeDisplay >= 0 ? '+' : ''}{formatChange(currentChangeDisplay)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentChgPercentDisplay >= 0
                        ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36]/80'
                        : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A]/80'
                      }`}>
                      {currentChgPercentDisplay >= 0 ? '+' : ''}{formatChangePercent(currentChgPercentDisplay)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base">Index performance</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                      Overall change over selection:{' '}
                      <span className={`font-bold ${getChangeColor(chartStats.changePercent)}`}>
                        {overallTrendPositive ? '+' : ''}{chartStats.changePercent.toFixed(2)}%
                      </span>
                    </p>
                  </div>

                  {/* Timeframe selector */}
                  <div className="flex bg-[#F3F4F6] dark:bg-[#252528] p-1 rounded-xl border border-transparent dark:border-[#2A2A2A]">
                    {(['1D', '5D', '1M', '6M', '1Y'] as Timeframe[]).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          setTimeframe(tf)
                          setHoverIndex(null)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === tf
                            ? 'bg-white dark:bg-[#314B44] text-[#44C2A4] dark:text-white shadow-sm'
                            : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'
                          }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

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

                        {/* Grid Lines */}
                        <line x1="0" y1="50" x2="600" y2="50" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />
                        <line x1="0" y1="125" x2="600" y2="125" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />
                        <line x1="0" y1="200" x2="600" y2="200" stroke="#888888" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.15} />

                        {/* Gradient shaded background */}
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

              {/* Index Statistics */}
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#44C2A4]" /> Index Info Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Index Open</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(indexQuote?.open || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Index High</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(indexQuote?.high || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Index Low</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(indexQuote?.low || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium block">Close (Prev)</span>
                    <span className="text-base font-bold text-[#1A1A1A] dark:text-white mt-1 block">
                      {formatPrice(indexQuote?.open || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Constituents list) */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#44C2A4]" /> Index Constituents
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Top weighted listed stock components of {indexNameDisplay}:
                </p>

                {constituents.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    Loading constituent stocks...
                  </div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6] dark:divide-[#2A2A2A]/50 space-y-1">
                    {constituents.map((stock: any) => {
                      const isPositive = Number(stock.pChg) >= 0

                      return (
                        <div
                          key={stock.symbol}
                          onClick={() => router.push(`/stocks/${stock.symbol}`)}
                          className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252528] rounded-xl px-2.5 transition-colors duration-200"
                        >
                          <div>
                            <span className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate max-w-[150px]">
                              {stock.name}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-xs text-[#1A1A1A] dark:text-white block">
                              {formatPrice(stock.ltP)}
                            </span>
                            <span className={`text-[10px] font-bold ${isPositive ? 'text-[#00D09C]' : 'text-[#E74C3C]'}`}>
                              {isPositive ? '+' : ''}{formatChangePercent(stock.pChg)}
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
        )}
      </div>
    </main>
  )
}
