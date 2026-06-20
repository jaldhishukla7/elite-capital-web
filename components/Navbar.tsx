'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Menu, Moon, Sun, TrendingUp, Settings, BarChart3, Briefcase, Heart, Info, X } from 'lucide-react'
import { useStocks } from '@/lib/hooks/useMarketData'

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const pathname = usePathname()
  const router = useRouter()
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Search the exchange-backed symbol directory instead of the small quoted list.
  const { stocks: filteredResults } = useStocks(8, {
    query: searchQuery,
    includeQuotes: false,
    refreshInterval: 60000,
    dedupingInterval: 10000,
  })

  // Synchronise dark mode class from HTML node
  useEffect(() => {
    const isHtmlDark = document.documentElement.classList.contains('dark')
    setIsDark(isHtmlDark)
  }, [])

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

  // Handle routing to details page
  const handleSelectSymbol = (symbol: string) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSelectedIndex(-1)
    router.push(`/stocks/${symbol.toUpperCase()}`)
  }

  // Handle key navigation inside search modal
  useEffect(() => {
    if (!isSearchOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < filteredResults.length ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredResults.length
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
          handleSelectSymbol(filteredResults[selectedIndex].symbol)
        } else if (searchQuery.trim()) {
          // Go directly to the queried symbol
          handleSelectSymbol(searchQuery.trim())
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, filteredResults, selectedIndex, searchQuery])

  // Focus input on search modal open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isSearchOpen])

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E8E8] dark:border-[#2A2A2A] shadow-sm">
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
              {/* Search Toggle Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                aria-label="Open search"
              >
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Global Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div 
            ref={searchContainerRef}
            className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A]">
              <Search className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedIndex(-1)
                }}
                placeholder="Search stocks by name or ticker symbol (e.g. CARRARO, TCS, INFY)..."
                className="flex-1 bg-transparent text-[#1A1A1A] dark:text-white placeholder-[#9CA3AF] text-sm focus:outline-none"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-full text-[#6B7280] dark:text-[#9CA3AF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Body */}
            <div className="p-2 max-h-[350px] overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="py-6 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#E8E8E8] dark:text-[#2A2A2A]" />
                  <p className="text-xs">Type a stock symbol or name to begin searching</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3 max-w-sm mx-auto">
                    {['CARRARO', 'RELIANCE', 'TCS', 'INFY', 'ZOMATO', 'SBIN'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          setSearchQuery(sym)
                          searchInputRef.current?.focus()
                        }}
                        className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-[#2A2A2A] hover:bg-[#F0FDF9] dark:hover:bg-[#314B44] text-[#1A1A1A] dark:text-white rounded-md transition-colors border border-[#E8E8E8] dark:border-transparent"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredResults.map((stock: any, index: number) => {
                    const isSelected = index === selectedIndex
                    return (
                      <div
                        key={stock.symbol}
                        onClick={() => handleSelectSymbol(stock.symbol)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                          isSelected 
                            ? 'bg-[#F0FDF9] dark:bg-[#1A3A36] border border-[#44C2A4]' 
                            : 'hover:bg-gray-50 dark:hover:bg-[#252528] border border-transparent'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                              {stock.symbol}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{stock.exchange}</span>
                            {stock.bseCode && (
                              <span className="text-xs text-gray-400 font-medium">BSE {stock.bseCode}</span>
                            )}
                          </div>
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-sm block">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-right min-w-[84px]">
                          <span className="font-bold text-xs text-[#44C2A4] block">
                            View details
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            {stock.isin || 'Listed equity'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {/* Direct look up option */}
                  <div
                    onClick={() => handleSelectSymbol(searchQuery)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 text-[#44C2A4] font-semibold text-sm ${
                      selectedIndex === filteredResults.length 
                        ? 'bg-[#F0FDF9] dark:bg-[#1A3A36] border border-[#44C2A4]' 
                        : 'hover:bg-gray-50 dark:hover:bg-[#252528] border border-transparent'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Look up details for &quot;{searchQuery.toUpperCase()}&quot; directly</span>
                  </div>
                </div>
              ) : (
                <div className="p-1">
                  <div
                    onClick={() => handleSelectSymbol(searchQuery)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 bg-[#F0FDF9] dark:bg-[#1A3A36] border border-[#44C2A4] text-[#44C2A4] font-semibold text-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <span>No directory match found. Open details for &quot;{searchQuery.toUpperCase()}&quot;</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Keyboard tips */}
            <div className="px-4 py-2 border-t border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1C] text-[10px] text-[#6B7280] dark:text-[#9CA3AF] flex justify-between">
              <span>Use <kbd className="font-sans font-bold">Up</kbd> <kbd className="font-sans font-bold">Down</kbd> to navigate</span>
              <span>Press <kbd className="font-sans font-bold">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
