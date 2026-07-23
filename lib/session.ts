import { cache } from 'react'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-utils'

export const requireSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED')
  }
  return session
})

export function isAuthFailure(err: unknown) {
  if (!(err instanceof Error)) return false
  // Next.js redirect()/notFound() throw special errors — never map those to /login.
  if (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: unknown }).digest === 'string'
  ) {
    const digest = (err as { digest: string }).digest
    if (digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND')) {
      return false
    }
  }
  return (
    err.message === 'UNAUTHENTICATED' ||
    err.message === 'FORBIDDEN' ||
    err.message.includes('no academyId') ||
    err.message.includes('no role')
  )
}

export const requireAcademyId = cache(async (): Promise<{
  academyId: string
  userId: string
  role: string
}> => {
  const session = await requireSession()
  const user = session.user as { academyId?: string; role?: string }
  const academyId = user.academyId
  const role = user.role

  if (!academyId) {
    throw new Error('Session user has no academyId — check your Better Auth additionalFields config')
  }

  // Fail closed: never invent ADMIN when role is missing from the session.
  if (!role) {
    throw new Error('Session user has no role — check your Better Auth additionalFields config')
  }

  return {
    academyId,
    userId: session.user.id,
    role,
  }
})

export const requireAdminSession = cache(async () => {
  const session = await requireSession()
  const role = (session.user as { role?: string }).role
  if (!role || !isAdminRole(role)) {
    throw new Error('FORBIDDEN')
  }
  return session
})
