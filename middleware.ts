import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie, getCookieCache } from 'better-auth/cookies'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'

const AUTH_PATHS = ['/login', '/register']
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/teacher', '/student']

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function needsRoleCheck(pathname: string) {
  return (
    AUTH_PATHS.includes(pathname) ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student')
  )
}

/**
 * Fast optimistic gate:
 * - Most /dashboard navigations only check cookie presence (no decrypt).
 * - Role is read from cookie cache only when redirecting from auth pages
 *   or gating /admin|/teacher|/student routes.
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PATHS.includes(pathname)
  const isProtected = isProtectedPath(pathname)

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fast path: authenticated dashboard browsing — no cookie decrypt.
  if (sessionCookie && pathname.startsWith('/dashboard') && !needsRoleCheck(pathname)) {
    return NextResponse.next()
  }

  let role: string | undefined

  if (sessionCookie && needsRoleCheck(pathname) && process.env.BETTER_AUTH_SECRET) {
    try {
      const isSecure = request.nextUrl.protocol === 'https:'
      const session = await getCookieCache(request, {
        secret: process.env.BETTER_AUTH_SECRET,
        isSecure,
      })
      role = (session?.user as { role?: string } | undefined)?.role
    } catch {
      role = undefined
    }
  }

  const dashboardPath = role ? getDashboardPathForRole(role) : '/dashboard'

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (sessionCookie && role && pathname.startsWith('/admin') && !isAdminRole(role)) {
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
