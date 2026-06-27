'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      let data: any = {}
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        const text = await res.text()
        console.error('Signup route returned non-JSON response:', res.status, text)
        throw new Error('Server returned an unexpected response. Please try again.')
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setIsLoading(false)
        return
      }

      router.push(`/verify-email?userId=${data.userId}&email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      console.error('Signup request failed:', err)
      setError('Server error. Please refresh the page and try again.')
      setIsLoading(false)
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
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            Join Elite Capital Markets to track and analyze the Indian markets.
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
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
              />
            </div>

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
                  name="mobile"
                  required
                  maxLength={10}
                  pattern="[6-9]\d{9}"
                  value={formData.mobile}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, mobile: digitsOnly })
                    setError('')
                  }}
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
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
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
              <p className="text-[11px] text-[#9CA3AF] mt-1">
                Must include an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#44C2A4]/40 focus:border-[#44C2A4]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#44C2A4] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
