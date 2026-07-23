import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const LESSON_TYPES = ['Individual', 'Group', 'Trial', 'Makeup'] as const
export type LessonType = (typeof LESSON_TYPES)[number]

export const lessonInputSchema = z
  .object({
    studentId: z.string().min(1, 'Student is required'),
    teacherId: z.string().min(1, 'Teacher is required'),
    subject: z.string().trim().min(1, 'Instrument / subject is required').max(80),
    level: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
    lessonType: z.enum(LESSON_TYPES).default('Individual'),
    room: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
    startTime: z.coerce.date({ message: 'Start time is required' }),
    endTime: z.coerce.date({ message: 'End time is required' }),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      })
    }
  })

export type LessonInput = z.infer<typeof lessonInputSchema>

export const lessonUpdateSchema = lessonInputSchema.partial().superRefine((data, ctx) => {
  if (data.startTime && data.endTime && data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be after start time',
      path: ['endTime'],
    })
  }
})

export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>
