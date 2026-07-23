'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import {
  lessonInputSchema,
  lessonUpdateSchema,
  computeDurationMinutes,
  type LessonStatusValue,
  type LessonTypeValue,
} from '@/lib/validations/lesson'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export type LessonListFilters = {
  search?: string
  teacherId?: string
  studentId?: string
  instrument?: string
  status?: LessonStatusValue | 'ALL'
  lessonType?: LessonTypeValue | 'ALL'
  dateFrom?: string
  dateTo?: string
  sort?: 'date' | 'teacher' | 'student'
  sortDir?: 'asc' | 'desc'
}

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

function revalidateLessonPaths(id?: string) {
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard/teachers')
  if (id) revalidatePath(`/dashboard/lessons/${id}`)
}

const lessonInclude = {
  student: {
    select: { id: true, firstName: true, lastName: true, instrument: true },
  },
  teacher: {
    select: { id: true, firstName: true, lastName: true },
  },
} as const

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export async function listLessons(filters: LessonListFilters = {}) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const where: Prisma.LessonWhereInput = {}

  if (filters.teacherId) where.teacherId = filters.teacherId
  if (filters.studentId) where.studentId = filters.studentId
  if (filters.instrument) where.instrument = filters.instrument
  if (filters.status && filters.status !== 'ALL') where.status = filters.status
  if (filters.lessonType && filters.lessonType !== 'ALL') where.lessonType = filters.lessonType

  if (filters.dateFrom || filters.dateTo) {
    where.startTime = {}
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      if (!Number.isNaN(from.getTime())) where.startTime.gte = startOfDay(from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      if (!Number.isNaN(to.getTime())) where.startTime.lte = endOfDay(to)
    }
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim()
    where.OR = [
      { instrument: { contains: q, mode: 'insensitive' } },
      { room: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
      { student: { firstName: { contains: q, mode: 'insensitive' } } },
      { student: { lastName: { contains: q, mode: 'insensitive' } } },
      { teacher: { firstName: { contains: q, mode: 'insensitive' } } },
      { teacher: { lastName: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const sort = filters.sort ?? 'date'
  const dir = filters.sortDir ?? 'desc'
  const orderBy: Prisma.LessonOrderByWithRelationInput[] =
    sort === 'teacher'
      ? [{ teacher: { lastName: dir } }, { startTime: 'desc' }]
      : sort === 'student'
        ? [{ student: { lastName: dir } }, { startTime: 'desc' }]
        : [{ startTime: dir }]

  return db.lesson.findMany({
    where,
    orderBy,
    include: lessonInclude,
  })
}

export async function listLessonsInRange(start: Date, end: Date) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.lesson.findMany({
    where: {
      startTime: { gte: start, lt: end },
      status: { notIn: ['CANCELLED'] },
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
    include: {
      ...lessonInclude,
      attendance: true,
      homework: { take: 5, orderBy: { createdAt: 'desc' } },
    },
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
        academyId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        instrument: data.instrument,
        level: data.level ?? null,
        lessonType: data.lessonType,
        room: data.room ?? null,
        lessonFee: data.lessonFee ?? null,
        durationMinutes: data.durationMinutes,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes ?? null,
        status: data.status,
      },
    })

    revalidateLessonPaths(lesson.id)
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

  let durationMinutes: number | undefined
  if (data.startTime && data.endTime) {
    durationMinutes = computeDurationMinutes(data.startTime, data.endTime)
  } else if (data.startTime || data.endTime) {
    const existing = await db.lesson.findUnique({
      where: { id },
      select: { startTime: true, endTime: true },
    })
    if (existing) {
      const start = data.startTime ?? existing.startTime
      const end = data.endTime ?? existing.endTime
      durationMinutes = computeDurationMinutes(start, end)
    }
  }

  try {
    await db.lesson.update({
      where: { id },
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        instrument: data.instrument,
        level: data.level === undefined ? undefined : data.level ?? null,
        lessonType: data.lessonType,
        room: data.room === undefined ? undefined : data.room ?? null,
        lessonFee: data.lessonFee === undefined ? undefined : data.lessonFee ?? null,
        durationMinutes,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes === undefined ? undefined : data.notes ?? null,
        status: data.status,
      },
    })

    revalidateLessonPaths(id)
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
    revalidateLessonPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Lesson not found.' }
    }
    console.error('deleteLesson failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}

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

/** Dashboard + entity detail helpers */
export async function getDashboardLessonStats() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [todaysLessons, upcomingLessons, completedToday, cancelledToday, recentLessons] =
    await Promise.all([
      db.lesson.findMany({
        where: { startTime: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
        orderBy: { startTime: 'asc' },
        include: lessonInclude,
      }),
      db.lesson.findMany({
        where: {
          startTime: { gt: todayEnd, lte: weekEnd },
          status: 'PLANNED',
        },
        orderBy: { startTime: 'asc' },
        take: 5,
        include: lessonInclude,
      }),
      db.lesson.count({
        where: { startTime: { gte: todayStart, lte: todayEnd }, status: 'COMPLETED' },
      }),
      db.lesson.count({
        where: { startTime: { gte: todayStart, lte: todayEnd }, status: 'CANCELLED' },
      }),
      db.lesson.findMany({
        where: { startTime: { lt: now } },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: lessonInclude,
      }),
    ])

  return { todaysLessons, upcomingLessons, completedToday, cancelledToday, recentLessons }
}
