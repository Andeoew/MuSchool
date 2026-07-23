import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth-utils'

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED')
  }
  return session
}

export async function requireAcademyId(): Promise<{
  academyId: string
  userId: string
  role: string
}> {
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
}

export async function requireAdminSession() {
  const session = await requireSession()
  const role = (session.user as { role?: string }).role
  if (!isAdminRole(role ?? '')) {
    throw new Error('FORBIDDEN')
  }
  return session
}
