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
  if (
    callbackUrl &&
    callbackUrl.startsWith('/') &&
    !callbackUrl.startsWith('//') &&
    !callbackUrl.startsWith('/login') &&
    !callbackUrl.startsWith('/register')
  ) {
    return callbackUrl
  }
  return getDashboardPathForRole(role ?? 'ADMIN')
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
