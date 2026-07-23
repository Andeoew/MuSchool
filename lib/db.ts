import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Single PrismaClient for the whole app (auth, tenant scope, transactions).
 * Never construct another PrismaClient — import `prisma` (or `prismaBase`) from here.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

/** Unscoped alias — Better Auth and cross-tenant admin/provisioning only. */
export const prismaBase = prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
