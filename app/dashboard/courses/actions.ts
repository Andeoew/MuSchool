'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId, requireAdminSession } from '@/lib/session'
import { courseInputSchema, courseUpdateSchema } from '@/lib/validations/course'
import {
  ActionResult,
  flattenFieldErrors,
  isNotFoundError,
  isUniqueConstraintError,
} from '@/lib/action-result'

function revalidateCoursePaths(id?: string) {
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard')
  if (id) revalidatePath(`/dashboard/courses/${id}`)
}

export async function listCourses(opts: { search?: string; active?: 'all' | 'active' | 'inactive' } = {}) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const where: Prisma.CourseWhereInput = {}
  if (opts.active === 'active') where.isActive = true
  if (opts.active === 'inactive') where.isActive = false
  if (opts.search?.trim()) {
    const q = opts.search.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { instrument: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const courses = await db.course.findMany({
    where,
    orderBy: [{ name: 'asc' }],
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        select: { teacherId: true, studentId: true },
      },
    },
  })

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    instrument: c.instrument,
    defaultDuration: c.defaultDuration,
    defaultLessonFee: c.defaultLessonFee,
    description: c.description,
    color: c.color,
    isActive: c.isActive,
    teacherCount: new Set(c.enrollments.map((e) => e.teacherId)).size,
    studentCount: new Set(c.enrollments.map((e) => e.studentId)).size,
    createdAt: c.createdAt,
  }))
}

export async function getCourse(id: string) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const course = await db.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        orderBy: { startDate: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!course) return null

  const now = new Date()
  const enrollmentIds = course.enrollments.map((e) => e.id)

  const [upcomingLessons, recentLessons, lessonStats] = await Promise.all([
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            startTime: { gte: now },
            status: { in: ['PLANNED', 'POSTPONED'] },
          },
          orderBy: { startTime: 'asc' },
          take: 8,
          include: {
            enrollment: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                teacher: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            OR: [
              { startTime: { lt: now } },
              { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
            ],
          },
          orderBy: { startTime: 'desc' },
          take: 8,
          include: {
            enrollment: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                teacher: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve({ total: 0, completed: 0, cancelled: 0, planned: 0 })
      : db.lesson
          .groupBy({
            by: ['status'],
            where: { enrollmentId: { in: enrollmentIds } },
            _count: { _all: true },
          })
          .then((rows) => {
            const map = Object.fromEntries(rows.map((r) => [r.status, r._count._all]))
            return {
              total: rows.reduce((s, r) => s + r._count._all, 0),
              completed: map.COMPLETED ?? 0,
              cancelled: map.CANCELLED ?? 0,
              planned: map.PLANNED ?? 0,
            }
          }),
  ])

  return { course, upcomingLessons, recentLessons, lessonStats }
}

export async function createCourse(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = courseInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data

  try {
    const course = await db.course.create({
      data: {
        academyId,
        name: data.name,
        instrument: data.instrument,
        defaultDuration: data.defaultDuration,
        defaultLessonFee: data.defaultLessonFee ?? null,
        description: data.description ?? null,
        color: data.color,
        isActive: data.isActive ?? true,
      },
    })
    revalidateCoursePaths(course.id)
    return { success: true, data: { id: course.id } }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Could not create course due to a conflict.' }
    }
    console.error('createCourse failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function updateCourse(id: string, input: unknown): Promise<ActionResult> {
  const parsed = courseUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data

  try {
    await db.course.update({
      where: { id },
      data: {
        name: data.name,
        instrument: data.instrument,
        defaultDuration: data.defaultDuration,
        defaultLessonFee: data.defaultLessonFee === undefined ? undefined : data.defaultLessonFee ?? null,
        description: data.description === undefined ? undefined : data.description ?? null,
        color: data.color,
        isActive: data.isActive,
      },
    })
    revalidateCoursePaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) return { success: false, error: 'Course not found.' }
    console.error('updateCourse failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const enrollmentCount = await db.enrollment.count({ where: { courseId: id } })
  if (enrollmentCount > 0) {
    return {
      success: false,
      error: 'Cannot delete a course with enrollments. Deactivate it instead.',
    }
  }

  try {
    await db.course.delete({ where: { id } })
    revalidateCoursePaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) return { success: false, error: 'Course not found.' }
    console.error('deleteCourse failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}

export async function listActiveCourses() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  return db.course.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      instrument: true,
      defaultDuration: true,
      defaultLessonFee: true,
      color: true,
    },
  })
}
