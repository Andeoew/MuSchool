import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Standard Next.js singleton pattern — prevents exhausting Postgres
// connections from hot-reload creating a new PrismaClient on every save.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Prisma 7's Rust-free "client" engine has no built-in connection engine —
// it requires an explicit driver adapter (or accelerateUrl) instead of
// reading DATABASE_URL implicitly like Prisma 6 and earlier did.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
