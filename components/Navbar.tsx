'use client'

import { useState } from 'react'
import { Search, Menu, Moon, Sun, TrendingUp } from 'lucide-react'

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navLinks = ['Stocks', 'Mutual Funds', 'IPO', 'ETFs', 'F&O', 'Commodities', 'News']

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
          </div>

          {/* Center navigation (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4] transition-colors"
              >
                {link}
              </a>
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

            {/* Open Account Button (desktop) */}
            <button className="hidden sm:inline-block px-4 py-2 bg-[#44C2A4] text-white text-sm font-semibold rounded-full hover:bg-[#3BA98A] transition-colors">
              Open Account
            </button>

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
          <div className="md:hidden pb-4 border-t border-[#E8E8E8] dark:border-[#2A2A2A]">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block py-3 px-2 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4]"
              >
                {link}
              </a>
            ))}
            <button className="w-full mt-3 px-4 py-2 bg-[#44C2A4] text-white text-sm font-semibold rounded-full hover:bg-[#3BA98A] transition-colors">
              Open Account
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
