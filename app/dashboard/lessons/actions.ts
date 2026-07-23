'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import {
  lessonInputSchema,
  lessonUpdateSchema,
  lessonTimeUpdateSchema,
  lessonCompleteSchema,
  computeDurationMinutes,
  type LessonStatusValue,
} from '@/lib/validations/lesson'
import {
  ActionResult,
  flattenFieldErrors,
  isNotFoundError,
  isUniqueConstraintError,
} from '@/lib/action-result'

export type LessonListFilters = {
  search?: string
  teacherId?: string
  studentId?: string
  courseId?: string
  instrument?: string
  status?: LessonStatusValue | 'ALL'
  dateFrom?: string
  dateTo?: string
  sort?: 'date' | 'teacher' | 'student' | 'course'
  sortDir?: 'asc' | 'desc'
}

function revalidateLessonPaths(id?: string) {
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard/teachers')
  if (id) revalidatePath(`/dashboard/lessons/${id}`)
}

const lessonInclude = {
  enrollment: {
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
      course: {
        select: {
          id: true,
          name: true,
          instrument: true,
          color: true,
          defaultDuration: true,
          defaultLessonFee: true,
        },
      },
    },
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
  const enrollmentWhere: Prisma.EnrollmentWhereInput = {}

  if (filters.teacherId) enrollmentWhere.teacherId = filters.teacherId
  if (filters.studentId) enrollmentWhere.studentId = filters.studentId
  if (filters.courseId) enrollmentWhere.courseId = filters.courseId
  if (filters.instrument) enrollmentWhere.course = { instrument: filters.instrument }
  if (Object.keys(enrollmentWhere).length) where.enrollment = enrollmentWhere

  if (filters.status && filters.status !== 'ALL') where.status = filters.status

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
      { room: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
      { enrollment: { student: { firstName: { contains: q, mode: 'insensitive' } } } },
      { enrollment: { student: { lastName: { contains: q, mode: 'insensitive' } } } },
      { enrollment: { teacher: { firstName: { contains: q, mode: 'insensitive' } } } },
      { enrollment: { teacher: { lastName: { contains: q, mode: 'insensitive' } } } },
      { enrollment: { course: { name: { contains: q, mode: 'insensitive' } } } },
      { enrollment: { course: { instrument: { contains: q, mode: 'insensitive' } } } },
    ]
  }

  const sort = filters.sort ?? 'date'
  const dir = filters.sortDir ?? 'desc'
  const orderBy: Prisma.LessonOrderByWithRelationInput[] =
    sort === 'teacher'
      ? [{ enrollment: { teacher: { lastName: dir } } }, { startTime: 'desc' }]
      : sort === 'student'
        ? [{ enrollment: { student: { lastName: dir } } }, { startTime: 'desc' }]
        : sort === 'course'
          ? [{ enrollment: { course: { name: dir } } }, { startTime: 'desc' }]
          : [{ startTime: dir }]

  return db.lesson.findMany({
    where,
    orderBy,
    include: lessonInclude,
  })
}

export async function listLessonsInRange(
  start: Date,
  end: Date,
  filters: {
    teacherId?: string
    studentId?: string
    courseId?: string
    instrument?: string
    status?: LessonStatusValue | 'ALL'
    search?: string
  } = {},
) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const where: Prisma.LessonWhereInput = {
    startTime: { gte: start, lt: end },
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status
  } else {
    where.status = { not: 'CANCELLED' }
  }

  const enrollmentWhere: Prisma.EnrollmentWhereInput = {}
  if (filters.teacherId) enrollmentWhere.teacherId = filters.teacherId
  if (filters.studentId) enrollmentWhere.studentId = filters.studentId
  if (filters.courseId) enrollmentWhere.courseId = filters.courseId
  if (filters.instrument) enrollmentWhere.course = { instrument: filters.instrument }
  if (Object.keys(enrollmentWhere).length) where.enrollment = enrollmentWhere

  if (filters.search?.trim()) {
    const q = filters.search.trim()
    where.AND = [
      {
        OR: [
          { enrollment: { student: { firstName: { contains: q, mode: 'insensitive' } } } },
          { enrollment: { student: { lastName: { contains: q, mode: 'insensitive' } } } },
          { enrollment: { teacher: { firstName: { contains: q, mode: 'insensitive' } } } },
          { enrollment: { teacher: { lastName: { contains: q, mode: 'insensitive' } } } },
          { enrollment: { course: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      },
    ]
  }

  return db.lesson.findMany({
    where,
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

  const enrollment = await db.enrollment.findUnique({
    where: { id: data.enrollmentId },
    select: { id: true, status: true },
  })
  if (!enrollment) return { success: false, error: 'Enrollment not found in your academy.' }
  if (enrollment.status !== 'ACTIVE') {
    return { success: false, error: 'Cannot schedule lessons for an inactive enrollment.' }
  }

  try {
    const lesson = await db.lesson.create({
      data: {
        academyId,
        enrollmentId: data.enrollmentId,
        room: data.room ?? null,
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

  if (data.enrollmentId) {
    const enrollment = await db.enrollment.findUnique({
      where: { id: data.enrollmentId },
      select: { id: true },
    })
    if (!enrollment) return { success: false, error: 'Enrollment not found in your academy.' }
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
      durationMinutes = computeDurationMinutes(
        data.startTime ?? existing.startTime,
        data.endTime ?? existing.endTime,
      )
    }
  }

  try {
    await db.lesson.update({
      where: { id },
      data: {
        enrollmentId: data.enrollmentId,
        room: data.room === undefined ? undefined : data.room ?? null,
        durationMinutes,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes === undefined ? undefined : data.notes ?? null,
        teacherNotes: data.teacherNotes === undefined ? undefined : data.teacherNotes ?? null,
        status: data.status,
      },
    })
    revalidateLessonPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) return { success: false, error: 'Lesson not found.' }
    console.error('updateLesson failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

/** Calendar drag/drop & resize — updates only times. */
export async function updateLessonTime(id: string, input: unknown): Promise<ActionResult> {
  const parsed = lessonTimeUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid time range.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const { startTime, endTime } = parsed.data

  try {
    await db.lesson.update({
      where: { id },
      data: {
        startTime,
        endTime,
        durationMinutes: computeDurationMinutes(startTime, endTime),
      },
    })
    revalidateLessonPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) return { success: false, error: 'Lesson not found.' }
    console.error('updateLessonTime failed:', err)
    return { success: false, error: 'Could not update lesson time.' }
  }
}

export async function setLessonStatus(
  id: string,
  status: LessonStatusValue,
  extras?: unknown,
): Promise<ActionResult> {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  let notes: string | undefined
  let teacherNotes: string | undefined

  if (status === 'COMPLETED' && extras !== undefined) {
    const parsed = lessonCompleteSchema.safeParse(extras)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Please check the highlighted fields.',
        fieldErrors: flattenFieldErrors(parsed.error),
      }
    }
    notes = parsed.data.notes
    teacherNotes = parsed.data.teacherNotes
  }

  try {
    await db.lesson.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes: notes ?? null } : {}),
        ...(teacherNotes !== undefined ? { teacherNotes: teacherNotes ?? null } : {}),
      },
    })
    revalidateLessonPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) return { success: false, error: 'Lesson not found.' }
    console.error('setLessonStatus failed:', err)
    return { success: false, error: 'Could not update lesson status.' }
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
    if (isNotFoundError(err)) return { success: false, error: 'Lesson not found.' }
    console.error('deleteLesson failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}

export async function listLessonFormOptions() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const enrollments = await db.enrollment.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ startDate: 'desc' }],
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
      course: {
        select: {
          id: true,
          name: true,
          instrument: true,
          color: true,
          defaultDuration: true,
        },
      },
    },
  })

  return { enrollments }
}

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

export async function getCalendarFilterOptions() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const [teachers, students, courses] = await Promise.all([
    db.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    }),
    db.student.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    }),
    db.course.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, instrument: true, color: true },
    }),
  ])

  return { teachers, students, courses }
}
