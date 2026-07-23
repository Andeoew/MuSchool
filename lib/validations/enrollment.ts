import { z } from 'zod'

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v)

export const ENROLLMENT_STATUSES = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const
export type EnrollmentStatusValue = (typeof ENROLLMENT_STATUSES)[number]

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatusValue, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const enrollmentInputSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  courseId: z.string().min(1, 'Course is required'),
  startDate: z.coerce.date({ message: 'Start date is required' }),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
  status: z.enum(ENROLLMENT_STATUSES).default('ACTIVE'),
})

export type EnrollmentInput = z.infer<typeof enrollmentInputSchema>

export const enrollmentUpdateSchema = enrollmentInputSchema.partial().omit({ studentId: true })
export type EnrollmentUpdateInput = z.infer<typeof enrollmentUpdateSchema>
