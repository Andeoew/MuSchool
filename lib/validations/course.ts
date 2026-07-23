import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const COURSE_COLORS = [
  '#C9A227',
  '#3B82F6',
  '#10B981',
  '#A855F7',
  '#F43F5E',
  '#F59E0B',
  '#06B6D4',
  '#8B5CF6',
] as const

export const courseInputSchema = z.object({
  name: z.string().trim().min(1, 'Course name is required').max(100),
  instrument: z.string().trim().min(1, 'Instrument is required').max(80),
  defaultDuration: z.coerce.number().int().min(15, 'Minimum 15 minutes').max(240),
  defaultLessonFee: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0, 'Fee cannot be negative').optional(),
  ),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color')
    .optional()
    .default('#C9A227'),
  isActive: z
    .union([z.boolean(), z.literal('true'), z.literal('false'), z.literal('on')])
    .optional()
    .transform((v) => {
      if (v === undefined) return true
      if (v === 'false') return false
      if (v === 'true' || v === 'on') return true
      return Boolean(v)
    }),
})

export type CourseInput = z.infer<typeof courseInputSchema>

export const courseUpdateSchema = courseInputSchema.partial()
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>
