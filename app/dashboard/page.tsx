import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { MarketOverview } from '@/components/MarketOverview'
import { QuickProducts } from '@/components/QuickProducts'
import { TopStocksTab } from '@/components/TopStocksTab'
import { PlatformPerks } from '@/components/PlatformPerks'
import { FAQSection } from '@/components/FAQSection'
import { Footer } from '@/components/Footer'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')
  if (!user.isProfileComplete) redirect('/complete-profile')

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />
      <MarketOverview />
      <QuickProducts />
      <TopStocksTab />
      <PlatformPerks />
      <FAQSection />
      <Footer />
    </main>
  )
}
