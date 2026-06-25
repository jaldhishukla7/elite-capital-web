import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow Next.js internals and static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Allow public pages
  const isPublic = pathname === '/' || PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublic) return NextResponse.next()

  // Check session cookie
  const token = req.cookies.get('ecm_session')?.value

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}