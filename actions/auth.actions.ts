'use server'

// actions/auth.actions.ts — Server Actions for authentication
// Public login uses Better Auth client (authClient.signIn.email).
// Logout must go through Better Auth so the session row is invalidated.

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  })
  redirect('/')
}
