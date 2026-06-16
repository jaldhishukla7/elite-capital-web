'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Layers, Flame, Coins, BarChart3, Zap } from 'lucide-react'

const products = [
  {
    name: 'Stocks',
    description: 'Invest in direct equity shares of listed Indian companies.',
    icon: TrendingUp,
    color: '#00D09C',
    bgLight: 'bg-[#E0F7F4]',
    bgDark: 'dark:bg-[#1A3A36]/40',
    link: '/stocks',
  },
  {
    name: 'Mutual Funds',
    description: 'Diversified wealth growth managed by expert fund managers.',
    icon: Layers,
    color: '#3B82F6',
    bgLight: 'bg-[#EBF5FF]',
    bgDark: 'dark:bg-[#1E2E4A]/40',
    link: '/watchlist', // fall back to watchlist or general pages
  },
  {
    name: 'IPOs',
    description: 'Apply for fresh share listings before they hit the market.',
    icon: Flame,
    color: '#EF4444',
    bgLight: 'bg-[#FEE2E2]',
    bgDark: 'dark:bg-[#3B1A1A]/40',
    link: '/stocks',
  },
  {
    name: 'Commodities',
    description: 'Trade Gold, Silver, and Crude Oil with live market rates.',
    icon: Coins,
    color: '#F59E0B',
    bgLight: 'bg-[#FEF3C7]',
    bgDark: 'dark:bg-[#3D2E1A]/40',
    link: '/commodities',
  },
  {
    name: 'ETFs',
    description: 'Buy index bundles and commodities in real-time, tradeable units.',
    icon: BarChart3,
    color: '#8B5CF6',
    bgLight: 'bg-[#F5F3FF]',
    bgDark: 'dark:bg-[#2D1F47]/40',
    link: '/indices',
  },
  {
    name: 'Futures & Options',
    description: 'Hedge risk and trade market volatility with leverage options.',
    icon: Zap,
    color: '#EC4899',
    bgLight: 'bg-[#FDF2F8]',
    bgDark: 'dark:bg-[#3D1E30]/40',
    link: '/portfolio',
  },
]

export function QuickProducts() {
  return (
    <section className="bg-white dark:bg-[#0D0D0D] py-12 md:py-16 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white">
            Explore Financial Products
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-sm md:text-base">
            Diversify your investment portfolio across direct equities, funds, futures, and precious metals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod, idx) => {
            const Icon = prod.icon
            return (
              <motion.div
                key={prod.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative cursor-pointer p-6 rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#161618] hover:border-[#44C2A4] dark:hover:border-[#44C2A4] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${prod.bgLight} ${prod.bgDark} transition-transform group-hover:scale-105 duration-300`}>
                    <Icon className="w-6 h-6" style={{ color: prod.color }} />
                  </div>

                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mt-4">
                    {prod.name}
                  </h3>
                  <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm mt-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3F4F6] dark:border-[#2A2A2A]/50">
                  <Link
                    href={prod.link}
                    className="inline-flex items-center text-sm font-semibold text-[#44C2A4] group-hover:text-[#3BA98A] transition-colors"
                  >
                    Invest Now &rarr;
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
