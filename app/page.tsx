'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { HeroSection } from '@/components/HeroSection'
import { MarketOverview } from '@/components/MarketOverview'
import { QuickProducts } from '@/components/QuickProducts'
import { TopStocksTab } from '@/components/TopStocksTab'
import { PlatformPerks } from '@/components/PlatformPerks'
import { FAQSection } from '@/components/FAQSection'
import { Footer } from '@/components/Footer'

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }
    setIsLoggedIn(!!getCookie('ecm_user'))
  }, [])

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />
      {!isLoggedIn && <HeroSection />}
      <MarketOverview />
      <QuickProducts />
      <TopStocksTab />
      <PlatformPerks />
      <FAQSection />
      <Footer />
    </main>
  )
}
