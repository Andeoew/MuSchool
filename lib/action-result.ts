/** Shared server-action result helpers (not a 'use server' module). */

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export function flattenFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join('.') : '_form'
    out[key] = out[key] ?? []
    out[key]!.push(issue.message)
  }
  return out
}

export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}

export function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  )
}
