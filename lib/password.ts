import { randomBytes } from 'crypto'

/**
 * Generates a temporary password suitable for Better Auth (min 8 chars).
 * Returned once to the admin so they can share it with the parent.
 */
export function generateTempPassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
  const bytes = randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += alphabet[bytes[i]! % alphabet.length]
  }
  return password
}
