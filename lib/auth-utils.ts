import type { Role } from '@/types'

export function getDashboardPathForRole(role: string): string {
  switch (role as Role) {
    case 'TEACHER':
      return '/teacher/dashboard'
    case 'PARENT':
      return '/student/dashboard'
    case 'SUPER_ADMIN':
    case 'ADMIN':
    default:
      return '/admin/dashboard'
  }
}

export function isAdminRole(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
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
