import { Prisma } from '@prisma/client'
import { prisma } from './db'

/**
 * Models that carry an academyId column AND expose a compound
 * `@@unique([academyId, id])` key in schema.prisma (Student, Teacher,
 * Parent, Lesson today). For these models, single-record update/delete/
 * upsert calls using `where: { id }` are automatically rewritten to use
 * the compound key, so a request can never touch another academy's row
 * even if it somehow guesses a valid id.
 *
 * Attendance, Homework, HomeworkAssignment, Payment, Announcement and
 * ParentStudent carry academyId but do NOT have that compound key yet —
 * for those, only filtering (findMany/findFirst/count/updateMany/
 * deleteMany) is auto-scoped. Single-record update/delete by `id` on
 * those models should go through a `findFirst({ where: { id, academyId }})`
 * existence check first until they get the same compound key.
 */
const MODELS_WITH_ID_COMPOUND = new Set([
  'Student',
  'Teacher',
  'Parent',
  'Lesson',
  'ParentStudent',
  'Course',
  'Enrollment',
])

const TENANT_MODELS = new Set([
  'Student',
  'Teacher',
  'Parent',
  'ParentStudent',
  'Course',
  'Enrollment',
  'Lesson',
  'Attendance',
  'Homework',
  'HomeworkAssignment',
  'Payment',
  'Announcement',
])

const READ_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
])
const BULK_WRITE_OPS = new Set(['updateMany', 'deleteMany'])
const CREATE_OPS = new Set(['create'])
const SINGLE_WRITE_OPS = new Set(['update', 'delete', 'upsert'])

/**
 * Returns a Prisma Client bound to one academy. Every query issued through
 * it is automatically filtered/stamped with academyId — application code
 * never has to (and never should) pass academyId manually.
 *
 * Usage:
 *   const db = forAcademy(session.academyId)
 *   await db.student.findMany()       // WHERE academyId = ...
 *   await db.student.create({ data }) // academyId injected into data
 *   await db.student.update({ where: { id }, data }) // scoped to this academy only
 */
export function forAcademy(academyId: string) {
  if (!academyId) {
    // Fail loudly. A silently-unscoped client is a cross-tenant data leak
    // waiting to happen — never let this slide even in a code path that
    // "should never" have a missing academyId.
    throw new Error('forAcademy() requires a non-empty academyId')
  }

  return prisma.$extends({
    name: `tenant-scope`,
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args)
          }

          if (READ_OPS.has(operation) || BULK_WRITE_OPS.has(operation)) {
            args.where = { ...(args.where ?? {}), academyId }
          }

          if (CREATE_OPS.has(operation)) {
            args.data = { ...(args.data ?? {}), academyId }
          }

          if (SINGLE_WRITE_OPS.has(operation)) {
            if (MODELS_WITH_ID_COMPOUND.has(model) && args.where?.id && !args.where?.academyId_id) {
              const { id, ...rest } = args.where
              args.where = { ...rest, academyId_id: { academyId, id } }
            } else {
              args.where = { ...(args.where ?? {}), academyId }
            }

            if (operation === 'upsert' && args.create) {
              args.create = { ...args.create, academyId }
            }
          }

          return query(args)
        },
      },
    },
  })
}

export type TenantClient = ReturnType<typeof forAcademy>
export type { Prisma }
