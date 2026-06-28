import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const userAgent = req.headers.get('user-agent') || undefined
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || undefined

    // Log the user in directly by creating a session, but leaving isEmailVerified as false in DB
    await createSession(
      user.id,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        clientId: user.clientId || '',
        role: user.role,
        accountBalance: user.dummyBalance ?? 0,
        isEmailVerified: user.isEmailVerified, // Will remain false
      },
      { userAgent, ipAddress }
    )

    return NextResponse.json({
      success: true,
      isProfileComplete: user.isProfileComplete,
      firstName: user.firstName,
      role: user.role,
    })
  } catch (error) {
    console.error('Skip verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
