import crypto from 'crypto'
import { cookies } from 'next/headers'

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I — avoids visual ambiguity
const CAPTCHA_LENGTH = 4
export const CAPTCHA_COOKIE_NAME = 'ecm_captcha'

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'dev-only-fallback-secret-change-in-prod'

/**
 * Generates a random alphanumeric CAPTCHA code (4 characters by default).
 */
export function generateCaptchaCode(length: number = CAPTCHA_LENGTH): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    const idx = crypto.randomInt(0, CAPTCHA_CHARS.length)
    code += CAPTCHA_CHARS[idx]
  }
  return code
}

/**
 * Renders a CAPTCHA code as a distorted inline SVG image.
 * No external service, no API key, no rate limits — generated entirely server-side.
 */
export function renderCaptchaSvg(code: string): string {
  const width = 140
  const height = 50
  const charSpacing = width / (code.length + 1)

  const letters = code
    .split('')
    .map((char, i) => {
      const x = charSpacing * (i + 1)
      const y = height / 2 + 6
      const rotation = (Math.random() - 0.5) * 30
      const hue = Math.floor(Math.random() * 360)
      return `<text x="${x}" y="${y}" font-size="26" font-weight="700" font-family="monospace" fill="hsl(${hue}, 45%, 35%)" text-anchor="middle" transform="rotate(${rotation} ${x} ${y})">${char}</text>`
    })
    .join('')

  const noiseLines = Array.from({ length: 4 })
    .map(() => {
      const x1 = Math.random() * width
      const y1 = Math.random() * height
      const x2 = Math.random() * width
      const y2 = Math.random() * height
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#CBD5E1" stroke-width="1" />`
    })
    .join('')

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="#F9FAFB" rx="8" />${noiseLines}${letters}</svg>`.trim()
}

function signCaptcha(code: string): string {
  return crypto.createHmac('sha256', CAPTCHA_SECRET).update(code).digest('hex')
}

/**
 * Generates a CAPTCHA, signs it, and stores it in a short-lived httpOnly
 * cookie. Returns the SVG markup to send to the client. No server-side
 * store (Redis/DB) needed — the signed cookie itself is tamper-resistant.
 */
export async function createCaptchaAndStore(): Promise<{ svg: string }> {
  const code = generateCaptchaCode()
  const svg = renderCaptchaSvg(code)
  const signature = signCaptcha(code)

  const cookieStore = await cookies()
  cookieStore.set(CAPTCHA_COOKIE_NAME, `${code}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60, // 5 minutes
  })

  return { svg }
}

/**
 * Verifies the user-submitted CAPTCHA text against the signed cookie value.
 * The cookie is deleted after verification (success or failure) so a
 * CAPTCHA can never be reused — protects against simple replay.
 */
export async function verifySubmittedCaptcha(submitted: string): Promise<boolean> {
  const cookieStore = await cookies()
  const stored = cookieStore.get(CAPTCHA_COOKIE_NAME)?.value

  cookieStore.delete(CAPTCHA_COOKIE_NAME)

  if (!stored || !submitted) return false

  const [code, signature] = stored.split('.')
  if (!code || !signature) return false

  const expectedSignature = signCaptcha(code)
  if (signature !== expectedSignature) return false

  return submitted.trim().toUpperCase() === code.trim().toUpperCase()
}
