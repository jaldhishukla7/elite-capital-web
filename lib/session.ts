import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const SESSION_COOKIE_NAME = 'ecm_session'
export const USER_COOKIE_NAME = 'ecm_user'
const SESSION_DURATION_DAYS = 30

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createSession(
  userId: string,
  userInfo: { firstName: string; lastName: string; email: string; clientId: string },
  metadata?: { userAgent?: string; ipAddress?: string }
) {
  const token = generateSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    },
  })

  const cookieStore = await cookies()

  // Session cookie — httpOnly for security
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  // User info cookie — readable by client JS for Navbar
  cookieStore.set(USER_COOKIE_NAME, JSON.stringify({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    email: userInfo.email,
    clientId: userInfo.clientId,
  }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  return { token, expiresAt }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const tokenHash = hashToken(token)

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  return session.user
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    const tokenHash = hashToken(token)
    await prisma.session.deleteMany({ where: { tokenHash } })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(USER_COOKIE_NAME)
}