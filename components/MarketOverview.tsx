'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface IndexData {
  name: string
  value: string
  change: string
  changePercent: string
  sparkline: number[]
}

const indexData: IndexData[] = [
  {
    name: 'NIFTY 50',
    value: '23,487.50',
    change: '+125.40',
    changePercent: '+0.54%',
    sparkline: [40, 50, 45, 60, 55, 75, 70, 85, 80, 90]
  },
  {
    name: 'SENSEX',
    value: '77,123.45',
    change: '+312.50',
    changePercent: '+0.41%',
    sparkline: [35, 48, 42, 58, 52, 72, 68, 82, 78, 88]
  },
  {
    name: 'NIFTY MIDCAP',
    value: '12,567.45',
    change: '+78.90',
    changePercent: '+0.63%',
    sparkline: [45, 55, 50, 65, 60, 80, 75, 90, 85, 95]
  },
  {
    name: 'NIFTY BANK',
    value: '47,823.15',
    change: '+456.20',
    changePercent: '+0.96%',
    sparkline: [30, 45, 40, 55, 50, 70, 65, 80, 75, 92]
  },
]

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  
  // Normalize data to 0-100 range
  const normalized = data.map((val) => ((val - min) / range) * 100)
  
  // Create path for sparkline
  const pathPoints = normalized
    .map((val, idx) => `${(idx / (normalized.length - 1)) * 300},${100 - val}`)
    .join(' L ')
  
  return (
    <svg viewBox="0 0 300 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={pathPoints}
        fill="none"
        stroke="#44C2A4"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function MarketOverview() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-12 md:py-16 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
              Markets at a Glance
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
              Real-time index data updated every 5 seconds
            </p>
          </div>

          {/* Index Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {indexData.map((index, idx) => (
              <motion.div
                key={index.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 ${
                  activeIndex === idx
                    ? 'bg-[#F0FDF9] dark:bg-[#1A3A36] border-[#44C2A4] shadow-lg'
                    : 'bg-white dark:bg-[#1A1A1A] border-[#E8E8E8] dark:border-[#2A2A2A] hover:border-[#44C2A4]'
                }`}
              >
                {/* Index Name */}
                <h3 className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">
                  {index.name}
                </h3>

                {/* Value */}
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white mt-2">
                  {index.value}
                </p>

                {/* Change */}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-sm font-semibold ${
                    index.change.startsWith('+')
                      ? 'text-[#00D09C]'
                      : 'text-[#E74C3C]'
                  }`}>
                    {index.change}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    index.changePercent.startsWith('+')
                      ? 'bg-[#E0F7F4] text-[#00D09C] dark:bg-[#1A3A36] dark:text-[#00D09C]'
                      : 'bg-[#FFEBEE] text-[#E74C3C] dark:bg-[#3A1A1A] dark:text-[#E74C3C]'
                  }`}>
                    {index.changePercent}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="mt-4 -mx-5 px-5">
                  <MiniSparkline data={index.sparkline} />
                </div>

                {/* View Details Link */}
                <button className="mt-4 text-sm font-semibold text-[#44C2A4] hover:text-[#3BA98A] transition-colors">
                  View Details →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
