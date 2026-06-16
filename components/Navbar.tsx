'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, Moon, Sun, TrendingUp, Settings, BarChart3, Briefcase, Heart, Info } from 'lucide-react'

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navLinks = [
    { label: 'Stocks', href: '/stocks', icon: TrendingUp },
    { label: 'Indices', href: '/indices', icon: BarChart3 },
    { label: 'Commodities', href: '/commodities', icon: Briefcase },
    { label: 'Watchlist', href: '/watchlist', icon: Heart },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  ]

  const footerLinks = [
    { label: 'About', href: '/about', icon: Info },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const allLinks = [...navLinks, ...footerLinks]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-16 z-50 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 bg-[#44C2A4] rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#1A1A1A] dark:text-white text-lg">
                Elite Capital
              </h1>
              <p className="text-[8px] text-[#6B7280] dark:text-[#9CA3AF] -mt-1">
                Smart Investing
              </p>
            </div>
          </Link>

          {/* Center navigation (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-[#44C2A4] border-b-2 border-[#44C2A4]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
              <Search className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-[#1A1A1A]" />
              )}
            </button>

            {/* Settings Link (desktop) */}
            <Link
              href="/settings"
              className="hidden sm:inline-flex p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg"
            >
              <Menu className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#E8E8E8] dark:border-[#2A2A2A] space-y-2">
            {allLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-[#F0FDF9] dark:bg-[#2A2A2A] text-[#44C2A4]'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
