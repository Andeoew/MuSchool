import { Prisma } from '@prisma/client'
import { prisma } from './db'

/**
 * Models with `@@unique([academyId, id])` — findUnique/update/delete by `id`
 * are rewritten to the compound key so Prisma WhereUniqueInput stays valid
 * and rows stay tenant-scoped.
 */
const MODELS_WITH_ID_COMPOUND = new Set([
  'Student',
  'Teacher',
  'Parent',
  'Lesson',
  'ParentStudent',
  'Course',
  'Enrollment',
  'Homework',
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

const FILTER_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
])

const CREATE_OPS = new Set(['create', 'createMany'])
const SINGLE_WRITE_OPS = new Set(['update', 'delete', 'upsert'])
const UNIQUE_READ_OPS = new Set(['findUnique', 'findUniqueOrThrow'])

function modelDelegate(model: string) {
  const key = model.charAt(0).toLowerCase() + model.slice(1)
  // Base (unextended) client — used only when demoting findUnique → findFirst.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[key] as {
    findFirst: (args: unknown) => Promise<unknown>
    findFirstOrThrow: (args: unknown) => Promise<unknown>
  }
}

/** Flatten Prisma compound unique objects into a normal where for findFirst. */
function flattenUniqueWhere(where: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(where)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (key.includes('_') || key.endsWith('Id'))
    ) {
      const nested = value as Record<string, unknown>
      // Compound unique shape: { academyId_email: { academyId, email } }
      if (key.includes('_') && !('equals' in nested) && !('in' in nested)) {
        Object.assign(out, nested)
        continue
      }
    }
    out[key] = value
  }
  return out
}

function rewriteIdToCompound(
  where: Record<string, unknown>,
  academyId: string,
): Record<string, unknown> | null {
  if (where.academyId_id && typeof where.academyId_id === 'object') {
    const compound = where.academyId_id as { academyId?: string; id?: string }
    return {
      academyId_id: {
        academyId,
        id: compound.id,
      },
    }
  }

  if (typeof where.id === 'string') {
    const keys = Object.keys(where).filter((k) => k !== 'academyId')
    if (keys.length === 1 && keys[0] === 'id') {
      return { academyId_id: { academyId, id: where.id } }
    }
  }

  return null
}

/**
 * Returns a Prisma Client bound to one academy. Every query issued through
 * it is automatically filtered/stamped with academyId.
 *
 * Usage:
 *   const db = forAcademy(session.academyId)
 *   await db.student.findMany()
 *   await db.student.findUnique({ where: { id } }) // → academyId_id
 */
export function forAcademy(academyId: string) {
  if (!academyId) {
    throw new Error('forAcademy() requires a non-empty academyId')
  }

  return prisma.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args)
          }

          const a = args as {
            where?: Record<string, unknown>
            data?: unknown
            create?: Record<string, unknown>
          }

          if (UNIQUE_READ_OPS.has(operation)) {
            const where = a.where ?? {}
            const compound = MODELS_WITH_ID_COMPOUND.has(model)
              ? rewriteIdToCompound(where, academyId)
              : null

            if (compound) {
              return query({ ...args, where: compound })
            }

            // Other unique selectors (email compounds, join keys, …):
            // demote to findFirst with academyId — findUnique cannot take extra filters.
            const flat = flattenUniqueWhere(where)
            delete flat.academyId
            const scoped = { ...args, where: { ...flat, academyId } }
            const delegate = modelDelegate(model)
            if (operation === 'findUniqueOrThrow') {
              return delegate.findFirstOrThrow(scoped)
            }
            return delegate.findFirst(scoped)
          }

          if (FILTER_OPS.has(operation)) {
            a.where = { ...(a.where ?? {}), academyId }
          }

          if (CREATE_OPS.has(operation)) {
            if (Array.isArray(a.data)) {
              a.data = (a.data as Record<string, unknown>[]).map((row) => ({
                ...row,
                academyId,
              }))
            } else {
              a.data = { ...(a.data as object | undefined), academyId }
            }
          }

          if (SINGLE_WRITE_OPS.has(operation)) {
            if (
              MODELS_WITH_ID_COMPOUND.has(model) &&
              a.where?.id &&
              !a.where?.academyId_id
            ) {
              const { id, academyId: _drop, ...rest } = a.where
              a.where = { ...rest, academyId_id: { academyId, id } }
            } else {
              a.where = { ...(a.where ?? {}), academyId }
            }

            if (operation === 'upsert' && a.create) {
              a.create = { ...a.create, academyId }
            }
          }

          return query(a as typeof args)
        },
      },
    },
  })
}

export type TenantClient = ReturnType<typeof forAcademy>
export type { Prisma }
