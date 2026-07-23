'use server'

// actions/auth.actions.ts — Server Actions for authentication
// Public login uses Better Auth client (authClient.signIn.email) — do not bypass it.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOutAction() {
  // TODO: await auth.api.signOut()
  const cookieStore = await cookies()
  cookieStore.delete('better-auth.session_token')
  redirect('/login')
}
