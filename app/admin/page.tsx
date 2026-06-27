import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { AdminDashboard } from '../../components/AdminDashboard'
import { AdminLogin } from '../../components/AdminLogin'

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <main className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {user && user.role === 'ADMIN' ? <AdminDashboard /> : <AdminLogin />}
    </main>
  )
}
