'use client'

import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
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
              Live market data, real-time charts, IPO tracker, mutual fund NAVs — everything you need to make informed investment decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-6 py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors flex items-center justify-center gap-2">
                Explore Stocks <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 bg-transparent border-2 border-[#44C2A4] text-[#44C2A4] font-semibold rounded-full hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] transition-colors flex items-center justify-center gap-2">
                View Mutual Funds <ArrowRight className="w-4 h-4" />
              </button>
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
                      Portfolio Overview
                    </p>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mt-2">
                      ₹4,50,234.50
                    </h2>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-3 border border-[#E8E8E8] dark:border-[#2A2A2A]">
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Today&apos;s Gain</p>
                      <p className="text-lg font-bold text-[#00D09C]">+2,450</p>
                    </div>
                    <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-3 border border-[#E8E8E8] dark:border-[#2A2A2A]">
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Return %</p>
                      <p className="text-lg font-bold text-[#00D09C]">+8.24%</p>
                    </div>
                  </div>

                  {/* Mini chart area */}
                  <div className="h-24 bg-gradient-to-b from-[#E0F7F4] to-transparent dark:from-[#1A3A36] dark:to-transparent rounded-lg flex items-end justify-around p-3">
                    {[0.3, 0.5, 0.7, 0.6, 0.85, 0.75, 1].map((height, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-[#44C2A4] rounded-t"
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Footer */}
                  <button className="w-full py-2 text-sm font-semibold text-[#44C2A4] hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] rounded-lg transition-colors">
                    View Full Dashboard →
                  </button>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 bg-white dark:bg-[#1A1A1A] rounded-xl p-4 shadow-lg border border-[#E8E8E8] dark:border-[#2A2A2A] w-40"
              >
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Best Performer</p>
                <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">Reliance Ind.</p>
                <p className="text-lg font-bold text-[#00D09C]">+12.5%</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
