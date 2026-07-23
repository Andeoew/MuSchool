'use server'

import { revalidatePath } from 'next/cache'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId, requireAdminSession } from '@/lib/session'
import { enrollmentInputSchema, enrollmentUpdateSchema } from '@/lib/validations/enrollment'
import {
  ActionResult,
  flattenFieldErrors,
  isNotFoundError,
  isUniqueConstraintError,
} from '@/lib/action-result'

function revalidateEnrollmentPaths(studentId?: string, teacherId?: string) {
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/lessons')
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard/teachers')
  if (studentId) revalidatePath(`/dashboard/students/${studentId}`)
  if (teacherId) revalidatePath(`/dashboard/teachers/${teacherId}`)
}

export async function createEnrollment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = enrollmentInputSchema.safeParse(input)
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

  const [student, teacher, course] = await Promise.all([
    db.student.findUnique({ where: { id: data.studentId }, select: { id: true } }),
    db.teacher.findUnique({ where: { id: data.teacherId }, select: { id: true } }),
    db.course.findUnique({ where: { id: data.courseId }, select: { id: true, isActive: true } }),
  ])

  if (!student) return { success: false, error: 'Student not found in your academy.' }
  if (!teacher) return { success: false, error: 'Teacher not found in your academy.' }
  if (!course) return { success: false, error: 'Course not found in your academy.' }
  if (!course.isActive) return { success: false, error: 'Cannot enroll in an inactive course.' }

  try {
    const enrollment = await db.enrollment.create({
      data: {
        academyId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        courseId: data.courseId,
        startDate: data.startDate,
        notes: data.notes ?? null,
        status: data.status,
      },
    })
    revalidateEnrollmentPaths(data.studentId, data.teacherId)
    return { success: true, data: { id: enrollment.id } }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return {
        success: false,
        error: 'This student is already enrolled in this course with this teacher.',
      }
    }
    console.error('createEnrollment failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function updateEnrollment(id: string, input: unknown): Promise<ActionResult> {
  const parsed = enrollmentUpdateSchema.safeParse(input)
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

  const existing = await db.enrollment.findUnique({
    where: { id },
    select: { studentId: true, teacherId: true },
  })
  if (!existing) return { success: false, error: 'Enrollment not found.' }

  if (data.teacherId) {
    const teacher = await db.teacher.findUnique({ where: { id: data.teacherId }, select: { id: true } })
    if (!teacher) return { success: false, error: 'Teacher not found in your academy.' }
  }
  if (data.courseId) {
    const course = await db.course.findUnique({ where: { id: data.courseId }, select: { id: true } })
    if (!course) return { success: false, error: 'Course not found in your academy.' }
  }

  try {
    await db.enrollment.update({
      where: { id },
      data: {
        teacherId: data.teacherId,
        courseId: data.courseId,
        startDate: data.startDate,
        notes: data.notes === undefined ? undefined : data.notes ?? null,
        status: data.status,
      },
    })
    revalidateEnrollmentPaths(existing.studentId, data.teacherId ?? existing.teacherId)
    return { success: true, data: undefined }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Enrollment conflict for this student/course/teacher.' }
    }
    if (isNotFoundError(err)) return { success: false, error: 'Enrollment not found.' }
    console.error('updateEnrollment failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function listActiveEnrollments(filters: {
  studentId?: string
  teacherId?: string
  courseId?: string
} = {}) {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.enrollment.findMany({
    where: {
      status: 'ACTIVE',
      studentId: filters.studentId,
      teacherId: filters.teacherId,
      courseId: filters.courseId,
    },
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
}

export async function listEnrollmentFormOptions() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const [students, teachers, courses] = await Promise.all([
    db.student.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    }),
    db.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    }),
    db.course.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, instrument: true, defaultDuration: true },
    }),
  ])

  return { students, teachers, courses }
}
