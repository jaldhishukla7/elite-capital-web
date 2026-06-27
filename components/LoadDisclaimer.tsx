'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

const DASHBOARD_PATH = '/dashboard'
const DISCLAIMER_DISMISSED_KEY = 'dashboardDisclaimerDismissed'

export function LoadDisclaimer() {
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()

  const isDashboardPage = pathname?.startsWith(DASHBOARD_PATH)

  useEffect(() => {
    if (!isDashboardPage) return

    const dismissed = typeof window !== 'undefined'
      ? window.localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true'
      : false

    if (dismissed) {
      setIsReady(true)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
      setIsReady(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [isDashboardPage])

  if (!isDashboardPage || (!isReady && typeof window !== 'undefined' && window.localStorage.getItem(DISCLAIMER_DISMISSED_KEY) === 'true')) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true')
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white dark:bg-[#161618] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative z-10 text-left"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                  Regulatory Disclaimer
                </h3>
                <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider font-semibold">
                  Indian Stock Markets
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-3 text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed max-h-[260px] overflow-y-auto pr-2">
              <p className="font-semibold text-[#1A1A1A] dark:text-white">
                Please review the regulatory disclaimers regarding trading and investing in the Indian Stock Markets:
              </p>
              <p>
                <strong>1. Market Risks:</strong> Investments in the securities market are subject to market risks. Read all related documents carefully before investing. Equity shares, mutual funds, and derivative contracts fluctuate in value based on market demands.
              </p>
              <p>
                <strong>2. No Assured Returns:</strong> Membership of a stock exchange or registration under SEBI does not guarantee platform performance or provide any assurance of returns to investors. Past performance is not indicative of future returns.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-[#E8E8E8] dark:border-[#2A2A2A]/50 flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-[#44C2A4] hover:bg-[#3BA98A] text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md focus:outline-none"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
