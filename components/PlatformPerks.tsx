'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Award, Lock } from 'lucide-react'

const perks = [
  {
    title: 'Zero Hidden Fees',
    desc: 'Transparent pricing with zero account maintenance charges and low direct brokerage fees.',
    icon: ShieldCheck,
  },
  {
    title: 'Superfast Execution',
    desc: 'State-of-the-art trade processing ensuring instant orders with minimal slippage.',
    icon: Zap,
  },
  {
    title: 'SEBI Regulated',
    desc: 'Operating with full regulatory approvals. Registered member of NSE, BSE, and CDSL.',
    icon: Award,
  },
  {
    title: 'Bank-Grade Security',
    desc: 'Protecting your funds and personal information with 256-bit SSL encryption and strict privacy protocols.',
    icon: Lock,
  },
]

export function PlatformPerks() {
  return (
    <section className="bg-[#FAFBFB] dark:bg-[#0A0A0B] py-12 md:py-16 px-4 md:px-6 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-bold text-[#44C2A4] uppercase tracking-widest bg-[#E0F7F4] dark:bg-[#1A3A36]/60 px-3 py-1 rounded-full">
              Trust & Security
            </span>
            <h2 className="text-3xl font-bold text-[#1A1A1A] dark:text-white leading-tight">
              Why Investors Trust Elite Capital
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm md:text-base leading-relaxed">
              We combine absolute regulatory compliance with robust technology to make investing simple, fast, and completely secure.
            </p>
          </div>

          {/* Perks Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {perks.map((perk, idx) => {
              const Icon = perk.icon
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="p-5 bg-white dark:bg-[#161618] rounded-xl border border-[#E8E8E8] dark:border-[#202022] hover:shadow-md transition-shadow flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F0FDF9] dark:bg-[#1A3A36]/40 flex items-center justify-center text-[#44C2A4]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white text-base">
                      {perk.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
