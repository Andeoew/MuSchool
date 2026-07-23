import type { Role } from '@/types'

export function getDashboardPathForRole(role: string): string {
  switch (role as Role) {
    case 'TEACHER':
      return '/teacher/dashboard'
    case 'PARENT':
    case 'STUDENT':
      return '/student/dashboard'
    case 'SUPER_ADMIN':
    case 'ADMIN':
    default:
      // Admin shell lives at /dashboard; /admin/dashboard redirects there.
      return '/dashboard'
  }
}

export function isAdminRole(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/** Safe post-login redirect: honor relative callbackUrl, else role dashboard. */
export function resolvePostAuthRedirect(
  role: string | undefined | null,
  callbackUrl?: string | null,
): string {
  // No role → do not default to ADMIN; send back through login.
  if (!role) return '/login'

  const home = getDashboardPathForRole(role)

  if (
    !callbackUrl ||
    !callbackUrl.startsWith('/') ||
    callbackUrl.startsWith('//') ||
    callbackUrl.startsWith('/login') ||
    callbackUrl.startsWith('/register')
  ) {
    return home
  }

  // Never send non-admins into the admin /dashboard shell via callbackUrl.
  if (
    !isAdminRole(role) &&
    (callbackUrl === '/dashboard' || callbackUrl.startsWith('/dashboard/'))
  ) {
    return home
  }

  if (role === 'TEACHER' && callbackUrl.startsWith('/student')) {
    return home
  }

  if (
    (role === 'PARENT' || role === 'STUDENT') &&
    callbackUrl.startsWith('/teacher')
  ) {
    return home
  }

  return callbackUrl
}

export const INSTRUMENT_OPTIONS = [
  'Piyano',
  'Gitar',
  'Keman',
  'Davul',
  'Vokal',
  'Flüt',
  'Çello',
  'Klarnet',
  'Saksafon',
  'Bas Gitar',
] as const
