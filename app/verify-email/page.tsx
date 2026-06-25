'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const email = searchParams.get('email') || ''

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError('')
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setDigits(newDigits)
    const lastFilledIndex = Math.min(pasted.length, 5)
    inputRefs.current[lastFilledIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed. Please try again.')
        setIsLoading(false)
        return
      }
      setSuccessMsg('Email verified! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not resend code.')
      } else {
        setResendCooldown(30)
        setDigits(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsResending(false)
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

        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#F0FDF9] dark:bg-[#1A3A36] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#44C2A4]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">Verify your email</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            We&apos;ve sent a 6-digit code to{' '}
            <span className="font-semibold text-[#1A1A1A] dark:text-white">{email}</span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FFEBEE] dark:bg-[#3A1A1A]/40 border border-[#E74C3C]/30 rounded-lg text-sm text-[#E74C3C] text-left">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-[#F0FDF9] dark:bg-[#1A3A36]/40 border border-[#44C2A4]/30 rounded-lg text-sm text-[#00D09C] text-left">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 border-[#E8E8E8] dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/30"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#44C2A4] text-white font-semibold rounded-full hover:bg-[#3BA98A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="mt-5 text-sm font-semibold text-[#44C2A4] hover:underline disabled:text-[#9CA3AF] disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : isResending
              ? 'Sending...'
              : "Didn't receive the code? Resend"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#44C2A4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}