'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Menu, Moon, Sun, TrendingUp, Settings, BarChart3, Briefcase, Heart, Info, X, LineChart, LogOut } from 'lucide-react'
import { useStocks } from '@/lib/hooks/useMarketData'
import { formatPrice, formatChangePercent } from '@/lib/utils/formatters'

interface UserInfo {
  firstName: string
  lastName: string
  email: string
  clientId?: string
  role?: string
  accountBalance?: number
  isEmailVerified?: boolean
}

export function Navbar() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const pathname = usePathname()
  const router = useRouter()

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const { stocks } = useStocks(100)

  // Read user info from cookie and sync with database in real-time
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }

    const updateUserInfo = (data: any) => {
      setUserInfo(prev => {
        const next = prev ? { ...prev, ...data } : data
        // Update client-side cookie if changed to keep it in sync across pages
        const rawCookie = getCookie('ecm_user')
        const currentCookieData = rawCookie ? JSON.parse(rawCookie) : {}
        const mergedCookieData = { ...currentCookieData, ...next }
        
        document.cookie = `ecm_user=${encodeURIComponent(JSON.stringify(mergedCookieData))}; path=/; max-age=${30 * 24 * 60 * 60}; sameSite=lax;`
        return next
      })
    }

    const raw = getCookie('ecm_user')
    if (raw) {
      try {
        setUserInfo(JSON.parse(raw))
      } catch {
        // cookie malformed
      }
    }

    // Function to fetch latest data from DB (includes accountBalance)
    const fetchFreshData = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            updateUserInfo({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              clientId: data.clientId,
              role: data.role,
              accountBalance: data.accountBalance,
              isEmailVerified: data.isEmailVerified,
            })
          }
        }
      } catch (err) {
        console.error('Error fetching real-time user info:', err)
      }
    }

    // Fetch immediately on mount
    fetchFreshData()

    // Poll every 4 seconds to keep balance/info updated in real-time
    const interval = setInterval(fetchFreshData, 4000)
    return () => clearInterval(interval)
  }, [])

  // Debounced real-time stock search API call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setSearchResults(data)
        }
      } catch (err) {
        console.error('Error searching:', err)
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

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
    { label: 'F&O', href: '/fo', icon: LineChart },
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

  // Removed static filteredResults definition

  const handleSelectSymbol = (symbol: string) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSelectedIndex(-1)
    router.push(`/stocks/${symbol.toUpperCase()}`)
  }

  useEffect(() => {
    if (!isSearchOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => prev < searchResults.length ? prev + 1 : 0)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : searchResults.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectSymbol(searchResults[selectedIndex].symbol)
        } else if (searchQuery.trim()) {
          handleSelectSymbol(searchQuery.trim())
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, searchResults, selectedIndex, searchQuery])

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
            <Link href={userInfo ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 bg-[#44C2A4] rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-[#1A1A1A] dark:text-white text-lg">Elite Capital</h1>
                <p className="text-[8px] text-[#6B7280] dark:text-[#9CA3AF] -mt-1">Smart Investing</p>
              </div>
            </Link>

            {/* Center navigation */}
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

            {/* Right side */}
            <div className="flex items-center gap-4">

              {/* User Info from cookie */}
              {userInfo ? (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#44C2A4] text-sm font-bold text-white">
                    {userInfo.firstName?.[0] ?? 'U'}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                      {userInfo.firstName} {userInfo.lastName}
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-[180px]">
                      {userInfo.email}
                    </span>
                    <span className="text-[11px] text-[#0F766E] dark:text-[#7EE7C5] mt-1">
                      Available balance: ₹{Number(userInfo.accountBalance ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {userInfo.role === 'ADMIN' && (
                    <span className="rounded-full bg-[#44C2A4] px-3 py-1 text-[11px] font-semibold text-white">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] dark:hover:text-[#44C2A4] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#44C2A4] hover:bg-[#3BA98A] rounded-full transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>

              {/* Dark mode */}
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

              {/* Settings */}
              <Link
                href="/settings"
                className="hidden sm:inline-flex p-2 hover:bg-[#F0FDF9] dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </Link>
              {userInfo?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex px-3 py-2 text-sm font-semibold text-white bg-[#1F7EFC] hover:bg-[#166fe0] rounded-full transition-colors"
                >
                  Admin
                </Link>
              )}

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
              {userInfo ? (
                <div className="px-3 py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A] mb-2">
                  <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                    {userInfo.firstName} {userInfo.lastName}{userInfo.clientId ? ` (${userInfo.clientId})` : ''}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{userInfo.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3 border-b border-[#E8E8E8] dark:border-[#2A2A2A] mb-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#44C2A4] hover:bg-[#3BA98A] rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
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
              {userInfo?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors text-[#1F7EFC] hover:bg-[#F0F7FF] dark:hover:bg-[#1F3451]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div
            ref={searchContainerRef}
            className="w-full max-w-2xl bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
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
                placeholder="Search stocks by name or ticker symbol (e.g. TCS, INFY, ZOMATO)..."
                className="flex-1 bg-transparent text-[#1A1A1A] dark:text-white placeholder-[#9CA3AF] text-sm focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-full text-[#6B7280] dark:text-[#9CA3AF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[350px] overflow-y-auto">
              {isSearching ? (
                <div className="py-6 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#44C2A4] mx-auto mb-2"></div>
                  <p className="text-xs">Searching Indian market...</p>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="py-6 text-center text-[#6B7280] dark:text-[#9CA3AF]">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#E8E8E8] dark:text-[#2A2A2A]" />
                  <p className="text-xs">Type a stock symbol or name to begin searching</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3 max-w-sm mx-auto">
                    {['RELIANCE', 'TCS', 'INFY', 'ZOMATO', 'SBIN', 'NIFTY50'].map((sym) => (
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
              ) : searchResults.length > 0 ? (
                <div className="space-y-0.5">
                  {searchResults.map((stock: any, index: number) => {
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
                            <span className="font-bold text-[#1A1A1A] dark:text-white text-sm">{stock.symbol.split('.')[0]}</span>
                            <span className="text-[10px] bg-[#44C2A4]/15 text-[#44C2A4] font-bold px-1.5 py-0.5 rounded uppercase">{stock.exchange || 'NSE'}</span>
                          </div>
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-sm block">{stock.name}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          {stock.price !== undefined ? (
                            <>
                              <span className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                                ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-[10px] font-bold ${stock.changePercent >= 0 ? 'text-[#44C2A4]' : 'text-[#E74C3C]'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                              </span>
                            </>
                          ) : (
                            <div className="text-[#44C2A4] font-medium text-xs flex items-center gap-1">
                              <span>View Detail</span>
                              <span>&rarr;</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-1">
                  <div
                    onClick={() => handleSelectSymbol(searchQuery)}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 bg-[#F0FDF9] dark:bg-[#1A3A36] border border-[#44C2A4] text-[#44C2A4] font-semibold text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>🔍</span>
                      <span>No direct match. Search &quot;{searchQuery.toUpperCase()}&quot; on MarketPlus &rarr;</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1C] text-[10px] text-[#6B7280] dark:text-[#9CA3AF] flex justify-between">
              <span>Use <kbd className="font-sans font-bold">↑</kbd> <kbd className="font-sans font-bold">↓</kbd> to navigate</span>
              <span>Press <kbd className="font-sans font-bold">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}