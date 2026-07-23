import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, getCookieCache } from 'better-auth/cookies'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'

const AUTH_PATHS = ['/login', '/register']
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/teacher', '/student']

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isAdminPath(pathname: string) {
  return pathname.startsWith('/admin')
}

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PATHS.includes(pathname)
  const isProtected = isProtectedPath(pathname)

  let role: string | undefined

  if (sessionCookie && process.env.BETTER_AUTH_SECRET) {
    try {
      const isSecure = request.nextUrl.protocol === 'https:'
      const session = await getCookieCache(request, {
        secret: process.env.BETTER_AUTH_SECRET,
        isSecure,
      })
      role = (session?.user as { role?: string } | undefined)?.role
    } catch {
      // Cookie cache is optimistic — never block navigation if decrypt fails.
      role = undefined
    }
  }

  const dashboardPath = role ? getDashboardPathForRole(role) : '/dashboard'

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // Only enforce role gates when role is known from cookie cache.
  // Missing role falls through; server layouts/actions remain authoritative.
  if (sessionCookie && role && isAdminPath(pathname) && !isAdminRole(role)) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (
    sessionCookie &&
    role &&
    pathname.startsWith('/teacher') &&
    role !== 'TEACHER' &&
    !isAdminRole(role)
  ) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (
    sessionCookie &&
    role &&
    pathname.startsWith('/student') &&
    role !== 'PARENT' &&
    role !== 'STUDENT' &&
    !isAdminRole(role)
  ) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/login',
    '/register',
  ],
}
