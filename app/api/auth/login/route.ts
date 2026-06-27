import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createSession } from '@/lib/session'
import { verifySubmittedCaptcha } from '@/lib/captcha'

export async function POST(req: NextRequest) {
  try {
    const { mobile, password, captcha } = await req.json()

    if (!mobile || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { mobile: mobile.trim() } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid mobile number or password.' }, { status: 401 })
    }

    if (!captcha) {
      return NextResponse.json(
        { error: 'Captcha is required for regular login.' },
        { status: 400 }
      )
    }

    const captchaValid = await verifySubmittedCaptcha(captcha)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Incorrect captcha. Please try again.', captchaFailed: true },
        { status: 400 }
      )
    }

    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid mobile number or password.' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      if (!user.isEmailVerified) {
        return NextResponse.json(
          {
            error: 'Please verify your email before logging in.',
            requiresVerification: true,
            userId: user.id,
            email: user.email,
          },
          { status: 403 }
        )
      }
    }

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

    return NextResponse.json({
      success: true,
      isProfileComplete: user.isProfileComplete,
      firstName: user.firstName,
      role: user.role,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}