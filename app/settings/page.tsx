'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LiveTicker } from '@/components/LiveTicker'
import { Save, Bell, Lock, Monitor } from 'lucide-react'

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
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        // Keep default settings
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: Settings = {
        refreshInterval: 5000,
        currency: 'INR',
        notifications: true,
        darkMode: false,
      }
      setSettings(defaultSettings)
      localStorage.setItem('settings', JSON.stringify(defaultSettings))
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

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            Settings saved successfully!
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
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.notifications
                    ? 'bg-[#44C2A4]'
                    : 'bg-[#E8E8E8] dark:bg-[#2A2A2A]'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-7' : 'translate-x-1'
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
                  Your watchlist and portfolio are stored locally on your device using browser storage. No data is sent to external servers.
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Tip: Regularly backup your data by exporting your portfolio settings
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-xl">
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-6">
              Data Management
            </h2>

            <div className="space-y-4">
              <button
                onClick={handleClearData}
                className="w-full px-4 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium text-left"
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
              className="flex-1 px-6 py-3 bg-[#44C2A4] text-white rounded-lg hover:bg-[#3BA89C] transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
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
            All settings are saved locally on your device
          </p>
        </div>
      </div>
    </main>
  )
}
