import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

/**
 * Runs a Prisma interactive transaction while guaranteeing every write is
 * stamped / filtered with the given academyId. Prefer this over calling
 * forAcademy() inside $transaction — extended-client interactive txs do not
 * reliably keep query extensions on the `tx` handle.
 */
export async function withAcademyTransaction<T>(
  academyId: string,
  fn: (tx: Prisma.TransactionClient, academyId: string) => Promise<T>,
): Promise<T> {
  if (!academyId) {
    throw new Error('withAcademyTransaction() requires a non-empty academyId')
  }
  return prisma.$transaction((tx) => fn(tx, academyId))
}
