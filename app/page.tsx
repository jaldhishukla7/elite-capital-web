'use client'

import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { HeroSection } from '@/components/HeroSection'
import { MarketOverview } from '@/components/MarketOverview'

export default function Page() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />
      <HeroSection />
      <MarketOverview />
    </main>
  )
}
