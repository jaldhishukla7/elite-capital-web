'use client'

import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description:
        'Get live quotes directly from NSE and BSE exchanges with instant updates every few seconds.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description:
        'Your data and portfolio information are securely stored and encrypted for maximum protection.',
    },
    {
      icon: Zap,
      title: 'Fast & Responsive',
      description:
        'Lightning-fast performance with optimized data fetching and seamless user experience across all devices.',
    },
    {
      icon: Globe,
      title: 'Comprehensive Coverage',
      description:
        'Track stocks, indices, and commodities across multiple exchanges with detailed market information.',
    },
  ]

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white mb-4">
            About Elite Capital Markets
          </h1>
          <p className="text-xl text-[#6B7280] dark:text-[#9CA3AF] max-w-2xl mx-auto">
            Your gateway to intelligent investing. Real-time market data, portfolio management, and insights for modern investors.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16 p-8 bg-gradient-to-r from-[#F0FDF9] to-[#E8F9F5] dark:from-[#1A3A36] dark:to-[#1A2A28] rounded-xl">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-lg leading-relaxed">
            At Elite Capital Markets, we believe that every investor deserves access to real-time, accurate market data and powerful portfolio management tools. We're committed to democratizing financial information and empowering individuals to make informed investment decisions. Our platform combines cutting-edge technology with user-friendly design to bring professional-grade market intelligence to your fingertips.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-8 text-center">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-10 h-10 text-[#44C2A4] mb-4" />
                  <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#44C2A4] mb-2">5000+</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">Stocks Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#44C2A4] mb-2">50+</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">Market Indices</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#44C2A4] mb-2">100K+</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-[#44C2A4] mb-2">99.9%</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">Uptime</p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16 p-8 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-6">
            Powered By
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-2">
                Data Sources
              </h3>
              <ul className="text-sm text-[#6B7280] dark:text-[#9CA3AF] space-y-1">
                <li>• NSE (National Stock Exchange)</li>
                <li>• BSE (Bombay Stock Exchange)</li>
                <li>• NCDEX (Commodities Exchange)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-2">
                Technology
              </h3>
              <ul className="text-sm text-[#6B7280] dark:text-[#9CA3AF] space-y-1">
                <li>• Next.js 16</li>
                <li>• React 19</li>
                <li>• TypeScript</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-2">
                Infrastructure
              </h3>
              <ul className="text-sm text-[#6B7280] dark:text-[#9CA3AF] space-y-1">
                <li>• Vercel Edge Network</li>
                <li>• ISR & Caching</li>
                <li>• Real-time WebSocket</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center p-8 bg-gradient-to-r from-[#F0FDF9] to-[#E8F9F5] dark:from-[#1A3A36] dark:to-[#1A2A28] rounded-xl">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            Have questions? We&apos;d love to hear from you. Reach out to our team.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="mailto:support@elitecapital.com"
              className="px-6 py-2 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors"
            >
              Email Us
            </a>
            <a
              href="#"
              className="px-6 py-2 border border-[#44C2A4] text-[#44C2A4] rounded-lg hover:bg-[#F0FDF9] dark:hover:bg-[#1A3A36] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
