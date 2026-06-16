'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import axios from 'axios'

interface MarketData {
  name: string
  value: number | string
  change: number | string
  changePercent: number | string
}

const mockData: MarketData[] = [
  { name: 'NIFTY 50', value: '23,487.50', change: '+125.40', changePercent: '+0.54%' },
  { name: 'NIFTY500', value: '15,623.80', change: '+89.20', changePercent: '+0.57%' },
  { name: 'NIFTYJR', value: '8,945.30', change: '+45.60', changePercent: '+0.51%' },
  { name: 'NIFTYMIDCAP150', value: '12,567.45', change: '+78.90', changePercent: '+0.63%' },
  { name: 'SENSEX', value: '77,123.45', change: '+312.50', changePercent: '+0.41%' },
  { name: 'GOLD', value: '₹7,234.50', change: '+145.00', changePercent: '+2.05%' },
  { name: 'SILVER', value: '₹89,234.00', change: '+1,245.00', changePercent: '+1.42%' },
  { name: 'CRUDE OIL', value: '$78.45', change: '+1.20', changePercent: '+1.55%' },
]

export function LiveTicker() {
  const [data, setData] = useState<MarketData[]>(mockData)
  const [lastUpdate, setLastUpdate] = useState<string>('Just now')

  // Simulate real-time data updates every 5 seconds
  // In production, replace with actual API calls to NSE/BSE data providers
  useEffect(() => {
    const updateData = () => {
      setLastUpdate('Just now')
      // Simulate small price movements
      setData(prev => prev.map(item => {
        const isPositive = Math.random() > 0.3
        const changeAmount = (Math.random() * 150).toFixed(2)
        const changePercent = (Math.random() * 2).toFixed(2)
        
        return {
          ...item,
          change: (isPositive ? '+' : '-') + changeAmount,
          changePercent: (isPositive ? '+' : '-') + changePercent + '%'
        }
      }))
    }

    const timer = setInterval(updateData, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#F0FDF9] to-[#F0FDF9] border-b border-[#E8E8E8] dark:from-[#1A1A1A] dark:to-[#1A1A1A] dark:border-[#2A2A2A]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">
            MARKET WATCH
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Scrolling ticker container */}
        <div className="flex-1 overflow-hidden mx-4">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* First set */}
            {data.map((item, idx) => (
              <div key={`${idx}-1`} className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.value}
                </span>
                <span
                  className={`text-sm font-semibold min-w-fit ${
                    String(item.change).startsWith('+')
                      ? 'text-[#00D09C]'
                      : 'text-[#E74C3C]'
                  }`}
                >
                  {item.change}
                </span>
                <span
                  className={`text-xs font-medium min-w-fit px-2 py-1 rounded-full ${
                    String(item.changePercent).startsWith('+')
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36] dark:text-[#00D09C]'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A] dark:text-[#E74C3C]'
                  }`}
                >
                  {item.changePercent}
                </span>
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {data.map((item, idx) => (
              <div key={`${idx}-2`} className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.name}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-white min-w-fit">
                  {item.value}
                </span>
                <span
                  className={`text-sm font-semibold min-w-fit ${
                    String(item.change).startsWith('+')
                      ? 'text-[#00D09C]'
                      : 'text-[#E74C3C]'
                  }`}
                >
                  {item.change}
                </span>
                <span
                  className={`text-xs font-medium min-w-fit px-2 py-1 rounded-full ${
                    String(item.changePercent).startsWith('+')
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36] dark:text-[#00D09C]'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A] dark:text-[#E74C3C]'
                  }`}
                >
                  {item.changePercent}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Last update indicator */}
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF] dark:text-[#6B7280] whitespace-nowrap">
          <span className="hidden sm:inline">Updated {lastUpdate}</span>
        </div>
      </div>
    </div>
  )
}
