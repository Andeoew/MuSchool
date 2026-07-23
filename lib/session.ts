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

export const requireAcademyId = cache(async (): Promise<{
  academyId: string
  userId: string
  role: string
}> => {
  const session = await requireSession()
  const user = session.user as { academyId?: string; role?: string }
  const academyId = user.academyId

  if (!academyId) {
    throw new Error('Session user has no academyId — check your Better Auth additionalFields config')
  }

  return {
    academyId,
    userId: session.user.id,
    role: user.role ?? 'ADMIN',
  }
})

export const requireAdminSession = cache(async () => {
  const session = await requireSession()
  const role = (session.user as { role?: string }).role
  if (!isAdminRole(role ?? '')) {
    throw new Error('FORBIDDEN')
  }
  return session
})
