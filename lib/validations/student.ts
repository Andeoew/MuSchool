import { z } from 'zod'
import { calculateAge } from '@/lib/age'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const PARENT_RELATIONSHIPS = ['Mother', 'Father', 'Guardian'] as const
export type ParentRelationship = (typeof PARENT_RELATIONSHIPS)[number]

export const studentInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email('Invalid email address').optional(),
  ),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  birthDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  instrument: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  level: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  isActive: z.coerce.boolean().default(true),
})

export type StudentInput = z.infer<typeof studentInputSchema>

export const studentUpdateSchema = studentInputSchema.partial()

/** Parent fields collected during student registration. */
export const parentInlineSchema = z.object({
  firstName: z.string().trim().min(1, 'Parent first name is required').max(80),
  lastName: z.string().trim().min(1, 'Parent last name is required').max(80),
  email: z.string().trim().email('Valid parent email is required'),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  relationship: z.enum(PARENT_RELATIONSHIPS, {
    message: 'Select Mother, Father, or Guardian',
  }),
  createLoginAccount: z.coerce.boolean().default(true),
})

export type ParentInlineInput = z.infer<typeof parentInlineSchema>

/**
 * Full create payload: student always required; parent optional unless the
 * student is a minor (under 18) with a birth date provided.
 */
export const createStudentWithParentSchema = studentInputSchema
  .extend({
    parent: parentInlineSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.birthDate && calculateAge(data.birthDate) < 18 && !data.parent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Parent information is required for students under 18.',
        path: ['parent'],
      })
    }
  })

export type CreateStudentWithParentInput = z.infer<typeof createStudentWithParentSchema>
