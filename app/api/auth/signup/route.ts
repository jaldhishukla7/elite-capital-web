import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, isPasswordStrong } from '@/lib/password'
import { createAndSendEmailOtp } from '@/lib/otp'

function generateRandomClientId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = 'EC'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, mobile, password, confirmPassword } = body

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const mobileRegex = /^[6-9]\d{9}$/ // Indian mobile numbers: 10 digits, starts 6-9
    if (!mobile || !mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
    }

    const strength = isPasswordStrong(password)
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { mobile }] },
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'mobile number'
      return NextResponse.json(
        { error: `An account with this ${field} already exists.` },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    // Generate unique client ID
    let isUnique = false
    let clientId = ''
    let attempts = 0
    while (!isUnique && attempts < 100) {
      clientId = generateRandomClientId()
      const existing = await prisma.user.findFirst({ where: { clientId } })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }
    if (!isUnique) {
      clientId = `EC${Date.now().toString().slice(-6)}`
    }

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        passwordHash,
        clientId,
        isEmailVerified: false,
        isProfileComplete: false,
      },
    })

    await createAndSendEmailOtp(user.id, user.email, user.firstName)

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email for the verification code.',
      userId: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
