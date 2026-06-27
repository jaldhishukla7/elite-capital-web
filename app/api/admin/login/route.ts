import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { createSession } from '@/lib/session'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'EliteWeb@123'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    let parsedBody: any = {}

    try {
      parsedBody = JSON.parse(rawBody || '{}')
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 })
    }

    const { email, password } = parsedBody

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        role: 'ADMIN',
        passwordHash,
      },
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: ADMIN_EMAIL,
        mobile: '9999999999',
        passwordHash,
        role: 'ADMIN',
        isEmailVerified: true,
        isProfileComplete: true,
        clientId: 'ADMIN-001',
      },
    })

    const userAgent = req.headers.get('user-agent') || undefined
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined

    await createSession(
      user.id,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        clientId: user.clientId || '',
        role: user.role,
        accountBalance: user.dummyBalance ?? 0,
      },
      { userAgent, ipAddress }
    )

    return NextResponse.json({ success: true, role: user.role })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
