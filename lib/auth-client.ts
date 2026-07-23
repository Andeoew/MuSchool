import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

/**
 * Prefer NEXT_PUBLIC_BETTER_AUTH_URL when set; otherwise Better Auth uses
 * the current origin (avoids localhost vs 127.0.0.1 cookie mismatches).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
        academyId: { type: 'string' },
        mustChangePassword: { type: 'boolean' },
      },
    }),
  ],
})

export const { signIn, signOut, useSession } = authClient
