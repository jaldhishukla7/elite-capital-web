'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8E8E8] dark:border-[#2A2A2A] text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#E74C3C] hover:border-[#E74C3C] transition-colors disabled:opacity-60"
      >
        <LogOut className="w-4 h-4" />
        {isLoading ? 'Logging out...' : 'Log Out'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 mb-4 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white text-center mb-2">
              Log Out of Elite Capital?
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] text-center mb-6">
              Are you sure you want to log out of your session? You will need to log back in to access your portfolio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#252528] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
