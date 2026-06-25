import { NextResponse } from 'next/server'
import { createCaptchaAndStore } from '@/lib/captcha'

/**
 * GET /api/auth/captcha
 * Generates a new CAPTCHA, stores a signed value in a short-lived httpOnly
 * cookie, and returns the SVG markup for the client to render.
 */
export async function GET() {
  try {
    const { svg } = await createCaptchaAndStore()
    return NextResponse.json({ svg })
  } catch (error) {
    console.error('Captcha generation error:', error)
    return NextResponse.json({ error: 'Could not generate captcha.' }, { status: 500 })
  }
}
