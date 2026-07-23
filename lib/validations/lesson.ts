import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const LESSON_STATUSES = ['PLANNED', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'NO_SHOW'] as const
export type LessonStatusValue = (typeof LESSON_STATUSES)[number]

export const LESSON_STATUS_LABELS: Record<LessonStatusValue, string> = {
  PLANNED: 'Planned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  POSTPONED: 'Postponed',
  NO_SHOW: 'No show',
}

function durationMinutes(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
}

export const lessonInputSchema = z
  .object({
    enrollmentId: z.string().min(1, 'Enrollment is required'),
    room: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
    startTime: z.coerce.date({ message: 'Start time is required' }),
    endTime: z.coerce.date({ message: 'End time is required' }),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
    status: z.enum(LESSON_STATUSES).default('PLANNED'),
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
  .transform((data) => ({
    ...data,
    durationMinutes: durationMinutes(data.startTime, data.endTime),
  }))

export type LessonInput = z.infer<typeof lessonInputSchema>

export const lessonUpdateSchema = z
  .object({
    enrollmentId: z.string().min(1).optional(),
    room: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
    teacherNotes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
    status: z.enum(LESSON_STATUSES).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      })
    }
  })

export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>

export const lessonTimeUpdateSchema = z
  .object({
    startTime: z.coerce.date({ message: 'Start time is required' }),
    endTime: z.coerce.date({ message: 'End time is required' }),
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

export const lessonCompleteSchema = z.object({
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  teacherNotes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
})

export function computeDurationMinutes(start: Date, end: Date): number {
  return durationMinutes(start, end)
}
