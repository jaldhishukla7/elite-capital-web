import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
  try {
    const admin = await getCurrentUser() as any
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        clientId: true,
        role: true,
        isEmailVerified: true,
        isProfileComplete: true,
        dummyBalance: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Admin users fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
