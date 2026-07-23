'use server'

// actions/auth.actions.ts — Server Actions for authentication
// Better Auth handles sessions; these are thin wrappers for server-side use.

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function signInAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = SignInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Geçersiz e-posta veya şifre.' }
  }
  // TODO: const result = await auth.api.signInEmail({ email, password })
  // TODO: set session cookie
  redirect('/dashboard')
}

export async function signOutAction() {
  // TODO: await auth.api.signOut()
  const cookieStore = await cookies()
  cookieStore.delete('better-auth.session_token')
  redirect('/login')
}
