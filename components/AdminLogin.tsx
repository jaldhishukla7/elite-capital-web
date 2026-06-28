'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Admin login failed. Please try again.')
        setIsLoading(false)
        return
      }

      router.push('/admin')
    } catch (err) {
      console.error('Admin login failed:', err)
      setError('Server error. Please refresh the page and try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#44C2A4]/10 text-[#44C2A4]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111827] dark:text-white">Admin Login</h1>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Enter the admin credentials to access the management console.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FFEBEE] dark:bg-[#3A1A1A]/40 border border-[#E74C3C]/30 rounded-lg text-sm text-[#E74C3C] text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/20 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#E8E8E8] bg-white px-4 py-3 pr-12 text-sm text-[#111827] outline-none focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/20 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#44C2A4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3BA98A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
