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
    const session = await getCookieCache(request, {
      secret: process.env.BETTER_AUTH_SECRET,
    })
    role = session?.user?.role as string | undefined
  }

  const dashboardPath = role ? getDashboardPathForRole(role) : '/admin/dashboard'

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (sessionCookie && isAdminPath(pathname) && role && !isAdminRole(role)) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (sessionCookie && pathname.startsWith('/teacher') && role !== 'TEACHER' && !isAdminRole(role ?? '')) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (sessionCookie && pathname.startsWith('/student') && role !== 'PARENT' && !isAdminRole(role ?? '')) {
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
