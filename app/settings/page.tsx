'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { Save, Bell, Lock, Monitor, LogOut, X } from 'lucide-react'

interface Settings {
  refreshInterval: number
  currency: string
  notifications: boolean
  darkMode: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    refreshInterval: 5000,
    currency: 'INR',
    notifications: true,
    darkMode: false,
  })
  const [accountBalance, setAccountBalance] = useState(0)
  const [userRole, setUserRole] = useState<string>('USER')
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string; clientId?: string; role?: string; isEmailVerified?: boolean } | null>(null)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Load settings from database (if logged in) or localStorage
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }

    const rawUser = getCookie('ecm_user')
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser)
        setUserInfo(u)
        setIsLoggedIn(true)
        setUserRole(u.role || 'USER')
      } catch (e) {
        // Fallback to default
      }

      // Load settings from database
      const fetchSettings = () => {
        fetch('/api/settings')
          .then((res) => res.json())
          .then((data) => {
            if (data && !data.error) {
              setSettings({
                refreshInterval: data.refreshInterval,
                currency: data.currency,
                notifications: data.notifications,
                darkMode: data.darkMode,
              })
              setAccountBalance(data.accountBalance ?? 0)
              setUserInfo(prev => prev ? {
                ...prev,
                isEmailVerified: data.isEmailVerified
              } : null)
            }
          })
          .catch(() => {})
      }

      fetchSettings()
      const interval = setInterval(fetchSettings, 4000)
      return () => clearInterval(interval)
    } else {
      const savedSettings = localStorage.getItem('settings')
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (e) {
          // Keep default settings
        }
      }
    }
  }, [])

  const handleSave = async () => {
    setSaveMessage('')
    setToastVisible(false)
    setIsSaving(true)
    localStorage.setItem('settings', JSON.stringify(settings))

    if (isLoggedIn) {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        })
        if (res.ok) {
          setSaved(true)
          setSaveMessage('Settings saved successfully!')
          setToastVisible(true)
        } else {
          setSaveMessage('Failed to save settings to the database.')
          setToastVisible(true)
        }
      } catch (e) {
        setSaveMessage('Network error while saving settings.')
        setToastVisible(true)
      }
    } else {
      setSaved(true)
      setSaveMessage('Settings saved locally on this device.')
      setToastVisible(true)
    }

    setIsSaving(false)
    setTimeout(() => setToastVisible(false), 3500)
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: Settings = {
        refreshInterval: 5000,
        currency: 'INR',
        notifications: true,
        darkMode: false,
      }
      setSettings(defaultSettings)
      localStorage.setItem('settings', JSON.stringify(defaultSettings))

      if (isLoggedIn) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultSettings),
        })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleClearData = () => {
    if (
      confirm(
        'This will delete your watchlist and portfolio. Are you sure?'
      )
    ) {
      localStorage.removeItem('watchlist')
      localStorage.removeItem('portfolio')
      alert('Your data has been cleared.')
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      <Navbar />
      <LiveTicker />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Customize your Elite Capital Markets experience
          </p>
        </div>

        {/* Success Toast */}
        {toastVisible && (
          <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-[#E8F7F0] bg-white dark:bg-[#111827] shadow-xl shadow-black/10 p-4 text-sm text-[#0F5132] dark:text-[#A7F3D0]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-[#10B981]" />
                <div>
                  <p className="font-semibold text-[#065F46] dark:text-[#A7F3D0]">{saveMessage}</p>
                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">Your preferences are now updated.</p>
                </div>
              </div>
              <button onClick={() => setToastVisible(false)} className="rounded-full p-1 text-[#4B5563] hover:text-[#111827] dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Display Settings */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-6 h-6 text-[#44C2A4]" />
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
                Display Settings
              </h2>
            </div>

            <div className="space-y-4">
              {/* Refresh Interval */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-2">
                  Data Refresh Interval (seconds)
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refreshInterval: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                >
                  <option value={1000}>1 second (Fast)</option>
                  <option value={5000}>5 seconds (Normal)</option>
                  <option value={10000}>10 seconds (Slow)</option>
                  <option value={30000}>30 seconds (Very Slow)</option>
                </select>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                  How often market data is refreshed in real-time
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44C2A4]"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-[#44C2A4]" />
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
                Notifications
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1A1A1A] dark:text-white mb-1">
                  Push Notifications
                </p>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  Receive alerts for price changes and portfolio updates
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: !settings.notifications,
                  })
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.notifications
                    ? 'bg-[#44C2A4]'
                    : 'bg-[#E8E8E8] dark:bg-[#2A2A2A]'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#44C2A4]" />
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
                Privacy & Security
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[#1A1A1A] dark:text-white mb-2">
                  Data Storage
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Your watchlist and portfolio are stored locally on your device using browser storage. Settings are saved {isLoggedIn ? 'securely in your database account' : 'locally on this device'}.
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Tip: Regularly backup your data by exporting your portfolio settings
                </p>
              </div>
            </div>
          </div>

          {/* Account Profile and Premium Logout */}
          {isLoggedIn && userInfo && (
            <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#44C2A4]/10 text-[#44C2A4] flex items-center justify-center font-bold text-lg">
                  {userInfo.firstName[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">Account Details</h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Manage your logged-in profile and session</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-[#202022] rounded-xl border border-[#E8E8E8] dark:border-[#2A2A2A]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{userInfo.firstName} {userInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Client ID</p>
                      <p className="text-sm font-mono font-semibold text-[#44C2A4]">{userInfo.clientId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Email Address</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white truncate">{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Account Role</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{userRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Account Balance</p>
                      <p className="text-sm font-semibold text-[#44C2A4]">₹{accountBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium uppercase tracking-wider mb-1">Verified Email</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{userInfo.isEmailVerified ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E8E8] dark:border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-white">Active Session</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Logout from your current session on this device</p>
                  </div>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-6">
              Data Management
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleClearData}
                className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium text-left"
              >
                Clear Watchlist & Portfolio
              </button>

              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                This action will permanently delete your watchlist and portfolio data stored on this device. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${isSaving ? 'bg-[#2D8D78] cursor-not-allowed' : 'bg-[#44C2A4] hover:bg-[#3BA89C]'}`}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save Settings'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-[#E8E8E8] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A] transition-colors font-semibold"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#E8E8E8] dark:border-[#2A2A2A] text-center">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Elite Capital Markets v1.0.0<br />
            All settings are saved {isLoggedIn ? 'securely in your database account' : 'locally on your device'}
          </p>
        </div>
      </div>

      {isLogoutModalOpen && (
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
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#252528] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLogoutModalOpen(false)
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/login'
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
