'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaSvg, setCaptchaSvg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/captcha')
      const data = await res.json()
      setCaptchaSvg(data.svg)
      setCaptchaInput('')
    } catch (err) {
      // leave previous captcha in place if refresh fails
    }
  }, [])

  useEffect(() => {
    loadCaptcha()
  }, [loadCaptcha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password, captcha: captchaInput }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.')
        setIsLoading(false)
        loadCaptcha() // one-time use regardless of outcome

        if (data.requiresVerification) {
          setTimeout(() => {
            router.push(`/verify-email?userId=${data.userId}&email=${encodeURIComponent(data.email)}`)
          }, 1500)
        }
        return
      }

      if (data.isProfileComplete) {
        router.push('/dashboard')
      } else {
        router.push('/complete-profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
      loadCaptcha()
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 bg-[#44C2A4] rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A1A] dark:text-white">Elite Capital</span>
        </Link>

        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            Log in to access your dashboard and watchlist.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FFEBEE] dark:bg-[#3A1A1A]/40 border border-[#E74C3C]/30 rounded-lg text-sm text-[#E74C3C]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161618] text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-r-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Enter the code shown below
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-shrink-0 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] overflow-hidden bg-[#F9FAFB]"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  aria-label="Refresh captcha"
                  className="flex-shrink-0 p-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#44C2A4] hover:border-[#44C2A4] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={4}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter the code above"
                className="w-full mt-2 px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#44C2A4] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
