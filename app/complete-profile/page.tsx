'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, User } from 'lucide-react'
import { isAtLeast18 } from '@/lib/age'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [prefill, setPrefill] = useState({ firstName: '', lastName: '', email: '', mobile: '' })
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Max DOB = exactly 18 years ago from today, so the browser's date
  // picker itself prevents selecting an underage date.
  const today = new Date()
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0]

  useEffect(() => {
    async function fetchPrefill() {
      try {
        const res = await fetch('/api/auth/complete-profile')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setPrefill(data)
      } catch (err) {
        setError('Could not load your details. Please try logging in again.')
      } finally {
        setIsFetching(false)
      }
    }
    fetchPrefill()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!dateOfBirth) {
      setError('Please enter your date of birth.')
      return
    }

    if (!isAtLeast18(dateOfBirth)) {
      setError('You must be at least 18 years old to use Elite Capital Markets.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateOfBirth }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#44C2A4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
          <div className="w-12 h-12 rounded-full bg-[#F0FDF9] dark:bg-[#1A3A36] flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-[#44C2A4]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">Complete your profile</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            Just one more step before you can start using Elite Capital Markets.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FFEBEE] dark:bg-[#3A1A1A]/40 border border-[#E74C3C]/30 rounded-lg text-sm text-[#E74C3C]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={prefill.firstName}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161618] text-[#6B7280] dark:text-[#9CA3AF] text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={prefill.lastName}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161618] text-[#6B7280] dark:text-[#9CA3AF] text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={prefill.email}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161618] text-[#6B7280] dark:text-[#9CA3AF] text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                value={`+91 ${prefill.mobile}`}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#161618] text-[#6B7280] dark:text-[#9CA3AF] text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                required
                max={maxDob}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                  setError('')
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">
                You must be at least 18 years old to use Elite Capital Markets.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
