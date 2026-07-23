/**
 * Age in full years from a birth date (local calendar).
 */
export function calculateAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age
}

export function isMinor(birthDate: Date, now: Date = new Date()): boolean {
  return calculateAge(birthDate, now) < 18
}
