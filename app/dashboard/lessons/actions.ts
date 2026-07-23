'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { lessonInputSchema, lessonUpdateSchema } from '@/lib/validations/lesson'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

function isNotFoundError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
}

function flattenFieldErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join('.') : '_form'
    out[key] = out[key] ?? []
    out[key]!.push(issue.message)
  }
  return out
}

function revalidateLessonPaths() {
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard/teachers')
}

const lessonInclude = {
  student: {
    select: { id: true, firstName: true, lastName: true, instrument: true },
  },
  teacher: {
    select: { id: true, firstName: true, lastName: true },
  },
} as const

export async function listLessonsInRange(start: Date, end: Date) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.lesson.findMany({
    where: {
      startTime: { gte: start, lt: end },
      status: { not: 'CANCELLED' },
    },
    orderBy: { startTime: 'asc' },
    include: lessonInclude,
  })
}

export async function getLesson(id: string) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.lesson.findUnique({
    where: { id },
    include: lessonInclude,
  })
}

export async function createLesson(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = lessonInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data

  const [student, teacher] = await Promise.all([
    db.student.findUnique({ where: { id: data.studentId }, select: { id: true } }),
    db.teacher.findUnique({ where: { id: data.teacherId }, select: { id: true } }),
  ])

  if (!student) return { success: false, error: 'Student not found in your academy.' }
  if (!teacher) return { success: false, error: 'Teacher not found in your academy.' }

  try {
    const lesson = await db.lesson.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subject: data.subject,
        level: data.level ?? null,
        lessonType: data.lessonType,
        room: data.room ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes ?? null,
        status: data.status,
      },
    })

    revalidateLessonPaths()
    return { success: true, data: { id: lesson.id } }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Could not create lesson due to a conflict.' }
    }
    console.error('createLesson failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function updateLesson(id: string, input: unknown): Promise<ActionResult> {
  const parsed = lessonUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data

  if (data.studentId) {
    const student = await db.student.findUnique({ where: { id: data.studentId }, select: { id: true } })
    if (!student) return { success: false, error: 'Student not found in your academy.' }
  }
  if (data.teacherId) {
    const teacher = await db.teacher.findUnique({ where: { id: data.teacherId }, select: { id: true } })
    if (!teacher) return { success: false, error: 'Teacher not found in your academy.' }
  }

  try {
    await db.lesson.update({
      where: { id },
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subject: data.subject,
        level: data.level === undefined ? undefined : data.level ?? null,
        lessonType: data.lessonType,
        room: data.room === undefined ? undefined : data.room ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes === undefined ? undefined : data.notes ?? null,
        status: data.status,
      },
    })

    revalidateLessonPaths()
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Lesson not found.' }
    }
    console.error('updateLesson failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    await db.lesson.delete({ where: { id } })
    revalidateLessonPaths()
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Lesson not found.' }
    }
    console.error('deleteLesson failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}

/** Options for the lesson form — academy-scoped. */
export async function listLessonFormOptions() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const [students, teachers] = await Promise.all([
    db.student.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, instrument: true },
    }),
    db.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, instruments: true },
    }),
  ])

  return { students, teachers }
}
