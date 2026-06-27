'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Pencil, Search, UserPlus } from 'lucide-react'

interface UserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  clientId: string | null
  role: string
  isEmailVerified: boolean
  isProfileComplete: boolean
  dummyBalance: number
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (Array.isArray(data)) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to load users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !amount) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, amount: Number(amount), note }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMessage(data.message || 'Amount credited successfully')
        setAmount('')
        setNote('')
        loadUsers()
      } else {
        setSuccessMessage(data.error || 'Failed to credit amount')
      }
    } catch (error) {
      console.error(error)
      setSuccessMessage('Failed to credit amount')
    } finally {
      setLoading(false)
      window.setTimeout(() => setSuccessMessage(''), 4000)
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.mobile.includes(query) ||
      user.clientId?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#44C2A4]">Admin control</p>
          <h1 className="mt-3 text-3xl font-bold text-[#111827] dark:text-white">User management</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">View every customer and assign dummy money directly.</p>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F8F5] text-[#0F766E] hover:bg-[#D0FAF2] transition-colors">
          <ArrowUpRight className="w-4 h-4" />
          Return to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-[#E5F7F2] bg-[#F7FFFC] p-6 shadow-sm dark:border-[#12322b] dark:bg-[#031d16]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#111827] dark:text-white">Customers</h2>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Search and select the customer you need to credit.</p>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, mobile or client ID"
                className="w-full sm:w-80 rounded-2xl border border-[#D1F3EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/20 dark:border-[#19322B] dark:bg-[#0B1912] dark:text-white"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#D1F3EB] bg-white dark:border-[#19322B] dark:bg-[#091B14]">
              <div className="grid grid-cols-[1.8fr_1.5fr_1.2fr_1.2fr_1fr] gap-4 px-5 py-4 text-xs uppercase tracking-[0.18em] text-[#6B7280] dark:text-[#8FBFB2]">
                <span>Name</span>
                <span>Email / Mobile</span>
                <span>Client ID</span>
                <span>Role</span>
                <span>Account balance</span>
              </div>
              <div className="divide-y divide-[#E5F7F2] dark:divide-[#12322b]">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${selectedUserId === user.id ? 'bg-[#E6FFFA] dark:bg-[#0b2e24]' : 'bg-white dark:bg-[#081913] hover:bg-[#F0FEF9] dark:hover:bg-[#0F2F23]'}`}
                  >
                    <div className="grid grid-cols-[1.8fr_1.5fr_1.2fr_1.2fr_1fr] gap-4 items-center text-sm text-[#111827] dark:text-white">
                      <span className="font-semibold">{user.firstName} {user.lastName}</span>
                      <span className="truncate text-[#6B7280] dark:text-[#9CA3AF]">{user.email} / {user.mobile}</span>
                      <span className="text-[#44C2A4]">{user.clientId || 'N/A'}</span>
                      <span className={user.role === 'ADMIN' ? 'text-[#0f766e]' : 'text-[#6B7280]'}>{user.role}</span>
                      <span className="font-semibold text-[#0f766e]">₹{user.dummyBalance.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-5 py-16 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">No matching users found.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E5F7F2] bg-white p-6 shadow-sm dark:border-[#12322B] dark:bg-[#071B14]">
              <h2 className="text-xl font-semibold text-[#111827] dark:text-white">Update Account Balance</h2>
              <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Adjust the selected customer&rsquo;s trading balance securely.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-white">Selected user</label>
                <div className="mt-2 rounded-2xl border border-[#D1F3EB] bg-[#F9FFFD] px-4 py-3 text-sm text-[#111827] dark:border-[#19322B] dark:bg-[#081B14] dark:text-white">
                  {selectedUserId ? users.find((u) => u.id === selectedUserId)?.firstName + ' ' + users.find((u) => u.id === selectedUserId)?.lastName : 'Choose a user from the list above'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-white">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#D1F3EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/20 dark:border-[#19322B] dark:bg-[#071B14] dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#111827] dark:text-white">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[#D1F3EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-[#44C2A4] focus:ring-2 focus:ring-[#44C2A4]/20 dark:border-[#19322B] dark:bg-[#071B14] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedUserId || !amount || loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#44C2A4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3BA98A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Update balance'}
              </button>

              {successMessage && (
                <p className="text-sm text-[#0F5132] dark:text-[#A7F3D0]">{successMessage}</p>
              )}
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[#E5F7F2] bg-[#F7FFFC] p-6 shadow-sm dark:border-[#12322B] dark:bg-[#031d16]">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-white">Admin notes</h3>
            <p className="mt-3 text-sm leading-7 text-[#6B7280] dark:text-[#9CA3AF]">
              Use this panel to track every customer and credit demo money after receiving real cash or digital payment.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-[#44C2A4]" />Update account balances instantly</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-[#44C2A4]" />View all users and balances</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-[#44C2A4]" />Works with admin-only access</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
