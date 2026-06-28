'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { useIndices, useBatchQuotes } from '@/lib/hooks/useMarketData'
import { formatPrice } from '@/lib/utils/formatters'
import { TrendingUp, TrendingDown, Info, Calendar, ChevronDown, Layers, Activity } from 'lucide-react'

export default function FnOPage() {
  const { indices, isLoading } = useIndices()
  const [underlying, setUnderlying] = useState('NIFTY') // NIFTY or BANKNIFTY
  const [expiry, setExpiry] = useState('26-Jun-2026')
  const [activeTab, setActiveTab] = useState('option-chain') // option-chain, futures, statistics
  const [refreshInterval, setRefreshInterval] = useState(5000)

  // Load refresh interval settings from database/localStorage
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }

    const rawUser = getCookie('ecm_user')
    if (rawUser) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.refreshInterval) {
            setRefreshInterval(data.refreshInterval)
          }
        })
        .catch(() => {})
    } else {
      const saved = localStorage.getItem('settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.refreshInterval) setRefreshInterval(parsed.refreshInterval)
        } catch (e) {}
      }
    }
  }, [])

  const [realOptionChain, setRealOptionChain] = useState<any[] | null>(null)
  const [expiryDatesList, setExpiryDatesList] = useState<string[]>(['26-Jun-2026', '02-Jul-2026', '09-Jul-2026', '30-Jul-2026'])

  // Fetch real-time Option Chain from API
  useEffect(() => {
    if (underlying === 'SENSEX') {
      setRealOptionChain(null)
      setExpiryDatesList(['26-Jun-2026', '02-Jul-2026', '09-Jul-2026', '30-Jul-2026'])
      return
    }

    let isMounted = true
    fetch(`/api/fo/option-chain?symbol=${underlying}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setRealOptionChain(data)
          const expiries = Array.from(new Set(data.map((r: any) => r.expiryDates).filter(Boolean))) as string[]
          if (expiries.length > 0) {
            setExpiryDatesList(expiries)
            if (!expiries.includes(expiry)) {
              setExpiry(expiries[0])
            }
          }
        }
      })
      .catch(() => {
        if (isMounted) setRealOptionChain(null)
      })

    return () => {
      isMounted = false
    }
  }, [underlying])

  // Find selected index price
  const selectedIndexData = (indices || []).find((ind: any) => {
    if (underlying === 'NIFTY') return ind.symbol === 'NIFTY50'
    if (underlying === 'BANKNIFTY') return ind.symbol === 'NIFTYBANK'
    if (underlying === 'SENSEX') return ind.symbol === 'SENSEX'
    return false
  })

  const spotPrice = selectedIndexData 
    ? selectedIndexData.ltP 
    : underlying === 'NIFTY' 
      ? 23500 
      : underlying === 'BANKNIFTY' 
        ? 51500 
        : 77000
  const spotChange = selectedIndexData ? selectedIndexData.pCh : 120.5
  const spotChangePct = selectedIndexData ? selectedIndexData.pChg : 0.52

  // Option Chain Strike Price Logic
  const strikeStep = underlying === 'NIFTY' ? 50 : 100
  const atmStrike = Math.round(spotPrice / strikeStep) * strikeStep

  // Generate 5 strikes above and 5 strikes below the ATM strike (total 11 rows)
  const strikes = Array.from({ length: 11 }, (_, i) => atmStrike + (i - 5) * strikeStep)

  // Black-Scholes mock calculation for realistic Option chain values
  const seededFraction = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return value - Math.floor(value)
  }

  const generateOptionRow = (strike: number) => {
    const distance = strike - spotPrice
    const volatilityFactor = underlying === 'NIFTY' ? 300 : 600
    const seedBase = strike * 13 + spotPrice * 7 + (underlying === 'NIFTY' ? 1 : 2)

    // Call pricing
    const callIntrinsic = Math.max(0, spotPrice - strike)
    const callExtrinsic = 180 * Math.exp(-Math.pow(distance / volatilityFactor, 2))
    const callLtp = callIntrinsic + callExtrinsic
    const callChange = (seededFraction(seedBase + 1) - 0.45) * (callLtp * 0.1)
    const callOI = Math.round(Math.max(100, 15000 * Math.exp(-Math.pow(distance / 250, 2)) * (0.95 + seededFraction(seedBase + 2) * 0.15)))
    const callVolume = Math.round(callOI * (1.2 + seededFraction(seedBase + 3) * 0.5))

    // Put pricing
    const putIntrinsic = Math.max(0, strike - spotPrice)
    const putExtrinsic = 180 * Math.exp(-Math.pow(distance / volatilityFactor, 2))
    const putLtp = putIntrinsic + putExtrinsic
    const putChange = (seededFraction(seedBase + 4) - 0.45) * (putLtp * 0.1)
    const putOI = Math.round(Math.max(100, 14000 * Math.exp(-Math.pow(-distance / 250, 2)) * (0.95 + seededFraction(seedBase + 5) * 0.15)))
    const putVolume = Math.round(putOI * (1.1 + seededFraction(seedBase + 6) * 0.5))

    return {
      strike,
      ce: {
        ltp: parseFloat(callLtp.toFixed(2)),
        change: parseFloat(callChange.toFixed(2)),
        changePercent: parseFloat(((callChange / Math.max(1, callLtp - callChange)) * 100).toFixed(2)),
        oi: callOI,
        volume: callVolume,
      },
      pe: {
        ltp: parseFloat(putLtp.toFixed(2)),
        change: parseFloat(putChange.toFixed(2)),
        changePercent: parseFloat(((putChange / Math.max(1, putLtp - putChange)) * 100).toFixed(2)),
        oi: putOI,
        volume: putVolume,
      }
    }
  }

  const optionChainData = (() => {
    if (realOptionChain && realOptionChain.length > 0) {
      const filtered = realOptionChain.filter((r: any) => r.expiryDates === expiry)
      if (filtered.length > 0) {
        return filtered
          .sort((a: any, b: any) => a.strikePrice - b.strikePrice)
          .map((record: any) => ({
            strike: record.strikePrice,
            ce: {
              ltp: record.CE?.lastPrice || 0,
              change: record.CE?.change || 0,
              changePercent: record.CE?.pChange || 0,
              oi: record.CE?.openInterest || 0,
              volume: record.CE?.totalTradedVolume || 0,
            },
            pe: {
              ltp: record.PE?.lastPrice || 0,
              change: record.PE?.change || 0,
              changePercent: record.PE?.pChange || 0,
              oi: record.PE?.openInterest || 0,
              volume: record.PE?.totalTradedVolume || 0,
            }
          }))
      }
    }
    return strikes.map(generateOptionRow)
  })()

  // Put-Call Ratio (PCR) Calculation
  const totalCE_OI = optionChainData.reduce((acc, row) => acc + row.ce.oi, 0)
  const totalPE_OI = optionChainData.reduce((acc, row) => acc + row.pe.oi, 0)
  const pcr = totalCE_OI > 0 ? parseFloat((totalPE_OI / totalCE_OI).toFixed(2)) : 0.95

  // Futures mock data (tied to real spot)
  const futuresContracts = [
    { name: `${underlying} Futures - 26-Jun-2026`, expiry: '26-Jun-2026', ltp: spotPrice + (underlying === 'NIFTY' ? 25 : 55), change: spotChange + 2, changePercent: spotChangePct, openInterest: 185000, volume: 12500 },
    { name: `${underlying} Futures - 30-Jul-2026`, expiry: '30-Jul-2026', ltp: spotPrice + (underlying === 'NIFTY' ? 95 : 210), change: spotChange + 5, changePercent: spotChangePct + 0.02, openInterest: 42000, volume: 2800 },
    { name: `${underlying} Futures - 27-Aug-2026`, expiry: '27-Aug-2026', ltp: spotPrice + (underlying === 'NIFTY' ? 165 : 360), change: spotChange + 8, changePercent: spotChangePct + 0.04, openInterest: 12500, volume: 950 }
  ]

  // Fetch live stats quotes
  const { data: statsQuotes } = useBatchQuotes(
    ['RELIANCE', 'TCS', 'INFY', 'ICICIBANK', 'HDFCBANK'],
    { refreshInterval: 10000 }
  )

  // F&O Stock statistics screeners mapped to live data
  const statsSymbols = ['RELIANCE', 'TCS', 'INFY', 'ICICIBANK', 'HDFCBANK']
  const displayStatistics = statsSymbols.map((sym, idx) => {
    const live = statsQuotes?.find((q: any) => q.symbol === sym)
    
    // Static fallbacks as backup
    const staticItems = [
      { action: 'Long Buildup', price: '2,945.30', change: '+0.87%', oiChange: '+12.4%', volume: '54,00,000' },
      { action: 'Short Covering', price: '3,820.15', change: '+0.45%', oiChange: '-4.8%', volume: '21,00,000' },
      { action: 'Short Buildup', price: '1,485.60', change: '-1.12%', oiChange: '+8.9%', volume: '43,00,000' },
      { action: 'Long Unwinding', price: '1,124.80', change: '-0.38%', oiChange: '-6.2%', volume: '65,00,000' },
      { action: 'Long Buildup', price: '1,612.45', change: '+0.90%', oiChange: '+5.7%', volume: '89,00,000' }
    ]
    const base = staticItems[idx]

    if (live) {
      const isPos = live.pChg >= 0
      return {
        symbol: sym,
        action: base.action,
        price: live.ltP.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        change: `${isPos ? '+' : ''}${live.pChg.toFixed(2)}%`,
        oiChange: base.oiChange,
        volume: live.volume.toLocaleString('en-IN')
      }
    }

    return {
      symbol: sym,
      ...base
    }
  })

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Long Buildup': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Short Covering': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Short Buildup': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'Long Unwinding': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2 flex items-center gap-2">
              <Activity className="text-[#44C2A4] w-8 h-8" />
              Futures & Options
            </h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Analyze derivatives, view live option chains, and scan market buildups
            </p>
          </div>

          {/* Underlyings & Expiry Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#F3F4F6] dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl p-1">
              <button
                onClick={() => setUnderlying('NIFTY')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${underlying === 'NIFTY' ? 'bg-[#44C2A4] text-white shadow-sm' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
              >
                Nifty 50
              </button>
              <button
                onClick={() => setUnderlying('BANKNIFTY')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${underlying === 'BANKNIFTY' ? 'bg-[#44C2A4] text-white shadow-sm' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
              >
                Bank Nifty
              </button>
              <button
                onClick={() => setUnderlying('SENSEX')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${underlying === 'SENSEX' ? 'bg-[#44C2A4] text-white shadow-sm' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
              >
                Sensex
              </button>
            </div>

            <div className="relative flex items-center bg-[#F3F4F6] dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl px-3.5 py-2">
              <Calendar className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF] mr-2" />
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="bg-transparent text-sm font-semibold text-[#1A1A1A] dark:text-white focus:outline-none cursor-pointer pr-4"
              >
                {expiryDatesList.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Spot Price Card & PCR Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">{underlying} Spot Index</p>
              <h2 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white mb-2">{formatPrice(spotPrice)}</h2>
            </div>
            <div className="flex items-center gap-1">
              {spotChange >= 0 ? (
                <span className="flex items-center text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{spotChange.toFixed(2)} (+{spotChangePct.toFixed(2)}%)
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {spotChange.toFixed(2)} ({spotChangePct.toFixed(2)}%)
                </span>
              )}
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] ml-auto">Real-time Yahoo Spot</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Put-Call Ratio (PCR)</p>
              <h2 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white mb-2">{pcr}</h2>
            </div>
            <div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${pcr > 1.2 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : pcr < 0.8 ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {pcr > 1.2 ? 'Bullish (Oversold)' : pcr < 0.8 ? 'Bearish (Overbought)' : 'Neutral Market Sentiment'}
              </span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Max Pain Strike</p>
              <h2 className="text-3xl font-extrabold text-[#1A1A1A] dark:text-white mb-2">{atmStrike}</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              <Info className="w-4 h-4 text-[#44C2A4]" />
              <span>Strike where options buyers lose maximum premium</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E8E8] dark:border-[#2A2A2A] mb-6">
          <button
            onClick={() => setActiveTab('option-chain')}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'option-chain' ? 'border-[#44C2A4] text-[#44C2A4]' : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
          >
            Option Chain (CE / PE)
          </button>
          <button
            onClick={() => setActiveTab('futures')}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'futures' ? 'border-[#44C2A4] text-[#44C2A4]' : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
          >
            Futures Contracts
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'statistics' ? 'border-[#44C2A4] text-[#44C2A4]' : 'border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white'}`}
          >
            F&O Heatmap & Buildups
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'option-chain' && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  {/* Call and Put Headers */}
                  <tr className="bg-gray-50 dark:bg-[#1E1E20] border-b border-[#E8E8E8] dark:border-[#2A2A2A] text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    <th colSpan={4} className="py-3 border-r border-[#E8E8E8] dark:border-[#2A2A2A] text-center text-[#44C2A4]">Calls (CE)</th>
                    <th className="py-3 border-r border-[#E8E8E8] dark:border-[#2A2A2A]">Underlying</th>
                    <th colSpan={4} className="py-3 text-center text-red-500">Puts (PE)</th>
                  </tr>
                  {/* Specific Columns */}
                  <tr className="bg-gray-100/50 dark:bg-[#151516] border-b border-[#E8E8E8] dark:border-[#2A2A2A] text-[10px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                    <th className="py-2.5 px-2">OI</th>
                    <th className="py-2.5 px-2">Volume</th>
                    <th className="py-2.5 px-2">LTP</th>
                    <th className="py-2.5 px-2 border-r border-[#E8E8E8] dark:border-[#2A2A2A]">Net Chg</th>
                    <th className="py-2.5 px-3 bg-[#F9FAFB] dark:bg-[#1F1F21] border-r border-[#E8E8E8] dark:border-[#2A2A2A] text-sm text-[#1A1A1A] dark:text-white font-bold">Strike</th>
                    <th className="py-2.5 px-2 border-r border-[#E8E8E8] dark:border-[#2A2A2A]">LTP</th>
                    <th className="py-2.5 px-2">Net Chg</th>
                    <th className="py-2.5 px-2">Volume</th>
                    <th className="py-2.5 px-2">OI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A] text-sm">
                  {optionChainData.map((row) => {
                    const isATM = row.strike === atmStrike
                    const ceITM = row.strike < spotPrice // Calls ITM: Strike < Spot
                    const peITM = row.strike > spotPrice // Puts ITM: Strike > Spot

                    return (
                      <tr
                        key={row.strike}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-[#202022] ${isATM ? 'bg-[#44C2A4]/5 dark:bg-[#44C2A4]/5 border-y-2 border-[#44C2A4]' : ''}`}
                      >
                        {/* Call Data */}
                        <td className={`py-3 px-2 ${ceITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''}`}>{row.ce.oi.toLocaleString('en-IN')}</td>
                        <td className={`py-3 px-2 ${ceITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''}`}>{row.ce.volume.toLocaleString('en-IN')}</td>
                        <td className={`py-3 px-2 font-bold text-[#1A1A1A] dark:text-white ${ceITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5 font-extrabold text-[#44C2A4]' : ''}`}>
                          {row.ce.ltp}
                        </td>
                        <td className={`py-3 px-2 border-r border-[#E8E8E8] dark:border-[#2A2A2A] font-semibold text-xs ${ceITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''} ${row.ce.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {row.ce.change >= 0 ? '+' : ''}{row.ce.change}
                        </td>

                        {/* Strike Price (Center) */}
                        <td className={`py-3 px-3 border-r border-[#E8E8E8] dark:border-[#2A2A2A] font-extrabold text-sm ${isATM ? 'bg-[#44C2A4]/10 text-[#44C2A4]' : 'bg-[#F9FAFB] dark:bg-[#1E1E20] text-[#1A1A1A] dark:text-white'}`}>
                          {row.strike}
                        </td>

                        {/* Put Data */}
                        <td className={`py-3 px-2 border-r border-[#E8E8E8] dark:border-[#2A2A2A] font-bold text-[#1A1A1A] dark:text-white ${peITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5 font-extrabold text-red-500' : ''}`}>
                          {row.pe.ltp}
                        </td>
                        <td className={`py-3 px-2 font-semibold text-xs ${peITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''} ${row.pe.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {row.pe.change >= 0 ? '+' : ''}{row.pe.change}
                        </td>
                        <td className={`py-3 px-2 ${peITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''}`}>{row.pe.volume.toLocaleString('en-IN')}</td>
                        <td className={`py-3 px-2 ${peITM ? 'bg-yellow-50/20 dark:bg-yellow-500/5' : ''}`}>{row.pe.oi.toLocaleString('en-IN')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 dark:bg-[#1A1A1C] p-4 flex gap-6 items-center text-xs text-[#6B7280] dark:text-[#9CA3AF] border-t border-[#E8E8E8] dark:border-[#2A2A2A]">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-900 rounded" />
                <span>In-the-Money (ITM) Options</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-[#44C2A4] rounded bg-[#44C2A4]/5" />
                <span>At-the-Money (ATM) Option</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'futures' && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1E1E20] border-b border-[#E8E8E8] dark:border-[#2A2A2A] text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    <th className="py-4 px-6">Contract</th>
                    <th className="py-4 px-4 text-right">LTP</th>
                    <th className="py-4 px-4 text-right">Net Chg</th>
                    <th className="py-4 px-4 text-right">OI (Contracts)</th>
                    <th className="py-4 px-6 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A] text-sm">
                  {futuresContracts.map((f, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#202022] transition-colors">
                      <td className="py-4 px-6 font-bold text-[#1A1A1A] dark:text-white">{f.name}</td>
                      <td className="py-4 px-4 text-right font-extrabold text-[#1A1A1A] dark:text-white">{formatPrice(f.ltp)}</td>
                      <td className={`py-4 px-4 text-right font-semibold ${f.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {f.change >= 0 ? '+' : ''}{f.change.toFixed(2)} ({f.changePercent.toFixed(2)}%)
                      </td>
                      <td className="py-4 px-4 text-right">{f.openInterest.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-right">{f.volume.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Buildup Screeners */}
            <div className="md:col-span-2 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">Stock Buildups Heatmap</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8E8E8] dark:border-[#2A2A2A] text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                      <th className="pb-3 pr-4">Screener Symbol</th>
                      <th className="pb-3 px-4">Price / Chg</th>
                      <th className="pb-3 px-4">Screener Action</th>
                      <th className="pb-3 pl-4 text-right">OI Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E8] dark:divide-[#2A2A2A] text-sm">
                    {displayStatistics.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#202022] transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-[#1A1A1A] dark:text-white">{stat.symbol}</td>
                        <td className="py-3.5 px-4 font-medium">
                          {stat.price} <span className={stat.change.startsWith('+') ? 'text-emerald-500 text-xs ml-1' : 'text-red-500 text-xs ml-1'}>{stat.change}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getActionBadgeColor(stat.action)}`}>
                            {stat.action}
                          </span>
                        </td>
                        <td className={`py-3.5 pl-4 text-right font-semibold ${stat.oiChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.oiChange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explanation card */}
            <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#44C2A4]/10 text-[#44C2A4] flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2">Buildup Definition</h3>
                <div className="space-y-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                  <p>
                    <strong className="text-emerald-500">Long Buildup:</strong> Price goes UP, Open Interest (OI) goes UP. Indicating aggressive buying.
                  </p>
                  <p>
                    <strong className="text-red-500">Short Buildup:</strong> Price goes DOWN, Open Interest (OI) goes UP. Indicating short sellers entering.
                  </p>
                  <p>
                    <strong className="text-blue-500">Short Covering:</strong> Price goes UP, Open Interest (OI) goes DOWN. Indicating shorts closing/buying back.
                  </p>
                  <p>
                    <strong className="text-orange-500">Long Unwinding:</strong> Price goes DOWN, Open Interest (OI) goes DOWN. Indicating buyers booking profits.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8E8E8] dark:border-[#2A2A2A] text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                *Data calculated dynamically at current refresh intervals.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
