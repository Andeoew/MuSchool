import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Tenant-scoped Prisma client.
 *
 * This is a defense-in-depth layer on top of the composite foreign keys
 * already enforced in schema.prisma. The composite FKs stop cross-tenant
 * *references* (e.g. a Lesson pointing at another academy's Student) at
 * the database level. This extension additionally stops cross-tenant
 * *reads and writes* at the application level, so a developer can never
 * accidentally forget a `where: { academyId }` clause.
 *
 * Usage in a route/server action:
 *
 *   const db = forAcademy(session.academyId);
 *   const students = await db.student.findMany(); // auto-scoped
 *
 * NEVER use the raw `prismaBase` client directly in request-handling code.
 * It has no tenant boundary and should only be used for cross-tenant admin
 * tooling (e.g. a super-admin dashboard) with its own explicit checks.
 */

const globalForPrisma = globalThis as unknown as { prismaBase?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prismaBase = globalForPrisma.prismaBase ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaBase = prismaBase;
}

// Models that carry an academyId column and must always be scoped.
const TENANT_MODELS = new Set([
  "User",
  "Student",
  "Teacher",
  "Parent",
  "ParentStudent",
  "Lesson",
  "Attendance",
  "Homework",
  "HomeworkAssignment",
  "Payment",
  "Announcement",
]);

const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const CREATE_OPS = new Set(["create", "createMany"]);

const WHERE_OPS = new Set(["update", "updateMany", "upsert", "delete", "deleteMany"]);

export function forAcademy(academyId: string) {
  if (!academyId) {
    throw new Error("forAcademy() requires a non-empty academyId");
  }

  return prismaBase.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          const a = args as Record<string, unknown>;

          if (READ_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), academyId };
          }

          if (CREATE_OPS.has(operation)) {
            if (Array.isArray(a.data)) {
              a.data = (a.data as Record<string, unknown>[]).map((row) => ({
                ...row,
                academyId,
              }));
            } else {
              a.data = { ...(a.data as object | undefined), academyId };
            }
          }

          if (WHERE_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), academyId };
            if (a.create) {
              a.create = { ...(a.create as object), academyId };
            }
          }

          return query(a as typeof args);
        },
      },
    },
  });
}

/**
 * KNOWN LIMITATION: this extension scopes top-level `where`/`data` only.
 * Nested writes (e.g. `student.create({ data: { lessons: { create: [...] } } })`)
 * are NOT auto-scoped for the nested relation and must set academyId
 * explicitly, or be broken into separate top-level calls through `forAcademy`.
 * Always prefer flat, explicit writes in tenant-sensitive code paths.
 */
