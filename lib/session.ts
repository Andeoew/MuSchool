import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

/**
 * ASSUMPTION — please verify against your real lib/auth.ts:
 * This assumes your Better Auth config exposes `academyId` on
 * session.user via a custom field, e.g.:
 *
 *   export const auth = betterAuth({
 *     // ...
 *     user: {
 *       additionalFields: {
 *         academyId: { type: 'string', required: true },
 *         role: { type: 'string', required: true },
 *       },
 *     },
 *   })
 *
 * If academyId isn't on the session yet, add it there (or fetch the User
 * row by session.user.id here) before using requireAcademyId() anywhere.
 */

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED')
  }
  return session
}

export async function requireAcademyId(): Promise<{ academyId: string; userId: string }> {
  const session = await requireSession()
  const academyId = (session.user as { academyId?: string }).academyId

  if (!academyId) {
    throw new Error('Session user has no academyId — check your Better Auth additionalFields config')
  }

  return { academyId, userId: session.user.id }
}
