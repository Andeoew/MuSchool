import { z } from 'zod'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const teacherInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Valid email is required'),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  instrument: z.enum(INSTRUMENT_OPTIONS, { message: 'Select a valid instrument' }),
  isActive: z.coerce.boolean().default(true),
  createLoginAccount: z.coerce.boolean().default(true),
})

export type TeacherInput = z.infer<typeof teacherInputSchema>

export const teacherUpdateSchema = teacherInputSchema
  .omit({ createLoginAccount: true })
  .partial()
  .extend({
    instrument: z.enum(INSTRUMENT_OPTIONS, { message: 'Select a valid instrument' }).optional(),
  })

export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>

/** @deprecated Prefer teacherInputSchema — kept for older admin form imports. */
export const createTeacherSchema = teacherInputSchema
export type CreateTeacherInput = TeacherInput
