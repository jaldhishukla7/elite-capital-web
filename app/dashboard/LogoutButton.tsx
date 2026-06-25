'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (err) {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8E8E8] dark:border-[#2A2A2A] text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#E74C3C] hover:border-[#E74C3C] transition-colors disabled:opacity-60"
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? 'Logging out...' : 'Log Out'}
    </button>
  )
}
