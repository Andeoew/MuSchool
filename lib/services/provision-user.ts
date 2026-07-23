import { hashPassword } from 'better-auth/crypto'
import { auth } from '@/lib/auth'
import { prismaBase } from '@/lib/db'
import { generateTempPassword } from '@/lib/password'

export type ProvisionRole = 'TEACHER' | 'PARENT' | 'STUDENT'

export type ProvisionUserInput = {
  academyId: string
  email: string
  name: string
  role: ProvisionRole
}

export type ProvisionCredentials = {
  userId: string
  /** Login identifier — project rule: normalized email (Better Auth email/password). */
  username: string
  /** Shown once to the admin. Never persisted in plaintext. */
  temporaryPassword: string
}

/**
 * Project rule: Better Auth signs in with email, so the username IS the
 * normalized email. Kept as an explicit helper so call sites stay readable
 * and future username strategies can land in one place.
 */
export function resolveUsername(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Creates a Better Auth user with a generated temporary password.
 * Password is hashed by Better Auth — never stored in plaintext.
 * Returns credentials exactly once for the admin to copy.
 */
export async function provisionUser(input: ProvisionUserInput): Promise<ProvisionCredentials> {
  const username = resolveUsername(input.email)
  const temporaryPassword = generateTempPassword()

  try {
    await auth.api.signUpEmail({
      body: {
        name: input.name.trim(),
        email: username,
        password: temporaryPassword,
        role: input.role,
        academyId: input.academyId,
        mustChangePassword: true,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (/already exists|duplicate|unique/i.test(message)) {
      throw new ProvisionError('DUPLICATE_EMAIL', 'This email is already in use for a login account.')
    }
    throw err
  }

  const user = await prismaBase.user.findFirst({
    where: { email: username, academyId: input.academyId },
    select: { id: true },
  })

  if (!user) {
    throw new ProvisionError('USER_MISSING', 'User was created but could not be loaded.')
  }

  await prismaBase.user.update({
    where: { id: user.id },
    data: { mustChangePassword: true },
  })

  return {
    userId: user.id,
    username,
    temporaryPassword,
  }
}

/**
 * Admin-initiated password reset. Generates a new temporary password, stores
 * only the Better Auth hash on the credential Account, and forces change on
 * next login. Previous passwords are never readable.
 */
export async function resetUserPassword(opts: {
  userId: string
  academyId: string
}): Promise<Omit<ProvisionCredentials, 'userId'> & { userId: string }> {
  const user = await prismaBase.user.findFirst({
    where: { id: opts.userId, academyId: opts.academyId },
    select: { id: true, email: true },
  })

  if (!user) {
    throw new ProvisionError('USER_MISSING', 'User account not found in this academy.')
  }

  const temporaryPassword = generateTempPassword()
  const hashed = await hashPassword(temporaryPassword)

  const updated = await prismaBase.account.updateMany({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
    data: { password: hashed },
  })

  if (updated.count === 0) {
    // Edge case: user exists without a credential account — create one.
    await prismaBase.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashed,
      },
    })
  }

  await prismaBase.user.update({
    where: { id: user.id },
    data: { mustChangePassword: true },
  })

  return {
    userId: user.id,
    username: resolveUsername(user.email),
    temporaryPassword,
  }
}

/** Compensating delete when a domain create fails after provisionUser. */
export async function deleteProvisionedUser(opts: {
  email: string
  academyId: string
}): Promise<void> {
  await prismaBase.user
    .deleteMany({
      where: {
        email: resolveUsername(opts.email),
        academyId: opts.academyId,
      },
    })
    .catch(() => undefined)
}

export class ProvisionError extends Error {
  constructor(
    public readonly code: 'DUPLICATE_EMAIL' | 'USER_MISSING' | 'FORBIDDEN',
    message: string,
  ) {
    super(message)
    this.name = 'ProvisionError'
  }
}
