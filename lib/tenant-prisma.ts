/**
 * Compatibility shim — single Prisma client lives in `@/lib/db`.
 * Tenant scoping lives in `@/lib/tenant-db`.
 *
 * Prefer importing `prisma` / `prismaBase` from `@/lib/db` and
 * `forAcademy` from `@/lib/tenant-db` in new code.
 */
export { prisma, prismaBase } from './db'
export { forAcademy } from './tenant-db'
