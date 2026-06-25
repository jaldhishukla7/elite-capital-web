import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailOtp } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json()

    if (!userId || !code) {
      return NextResponse.json({ error: 'Missing userId or code.' }, { status: 400 })
    }

    const result = await verifyEmailOtp(userId, code)

    if (!result.success) {
      const messages: Record<string, string> = {
        NOT_FOUND: 'No active verification code found. Please request a new one.',
        EXPIRED: 'This code has expired. Please request a new one.',
        INVALID: 'Incorrect code. Please check and try again.',
      }
      return NextResponse.json({ error: messages[result.reason || 'INVALID'] }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
