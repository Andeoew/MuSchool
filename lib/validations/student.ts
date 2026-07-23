import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const studentInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email('Invalid email address').optional(),
  ),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  instrument: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  level: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  isActive: z.coerce.boolean().default(true),
})

export type StudentInput = z.infer<typeof studentInputSchema>

// For updates we accept a partial patch — only the fields being changed.
export const studentUpdateSchema = studentInputSchema.partial()
