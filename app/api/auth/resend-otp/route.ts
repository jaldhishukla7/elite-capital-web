import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAndSendEmailOtp } from '@/lib/otp'

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

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'This account is already verified.' }, { status: 400 })
    }

    await createAndSendEmailOtp(user.id, user.email, user.firstName)

    return NextResponse.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
