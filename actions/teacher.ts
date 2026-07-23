'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAdminSession, requireAcademyId } from '@/lib/session'
import {
  provisionUser,
  resetUserPassword,
  deleteProvisionedUser,
  ProvisionError,
} from '@/lib/services/provision-user'
import { teacherInputSchema, teacherUpdateSchema } from '@/lib/validations/teacher'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export type IssuedLogin = {
  label: string
  username: string
  temporaryPassword: string
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

function revalidateTeacherPaths(id?: string) {
  revalidatePath('/dashboard/teachers')
  revalidatePath('/admin/teachers')
  if (id) revalidatePath(`/dashboard/teachers/${id}`)
}

export async function createTeacher(
  input: unknown,
): Promise<ActionResult<{ id: string; credentials?: IssuedLogin[] }>> {
  await requireAdminSession()

  const parsed = teacherInputSchema.safeParse(input)
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
  let provisionedEmail: string | null = null

  try {
    let userId: string | null = null
    let credentials: IssuedLogin[] | undefined

    if (data.createLoginAccount) {
      const login = await provisionUser({
        academyId,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        role: 'TEACHER',
      })
      provisionedEmail = data.email
      userId = login.userId
      credentials = [
        {
          label: 'Teacher login',
          username: login.username,
          temporaryPassword: login.temporaryPassword,
        },
      ]
    }

    const teacher = await db.teacher.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        instruments: [data.instrument],
        isActive: data.isActive,
        userId,
      },
    })

    revalidateTeacherPaths(teacher.id)
    return { success: true, data: { id: teacher.id, credentials } }
  } catch (err) {
    if (provisionedEmail) {
      await deleteProvisionedUser({ email: provisionedEmail, academyId })
    }

    if (err instanceof ProvisionError && err.code === 'DUPLICATE_EMAIL') {
      return { success: false, error: err.message }
    }
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'A teacher with this email is already registered at your academy.' }
    }
    console.error('createTeacher failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function updateTeacher(id: string, input: unknown): Promise<ActionResult> {
  await requireAdminSession()

  const parsed = teacherUpdateSchema.safeParse(input)
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

  try {
    await db.teacher.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone === undefined ? undefined : data.phone ?? null,
        isActive: data.isActive,
        instruments: data.instrument ? [data.instrument] : undefined,
      },
    })
    revalidateTeacherPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Teacher not found.' }
    }
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'A teacher with this email is already registered at your academy.' }
    }
    console.error('updateTeacher failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function deleteTeacher(id: string): Promise<ActionResult> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    const teacher = await db.teacher.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })
    if (!teacher) {
      return { success: false, error: 'Teacher not found.' }
    }

    await db.teacher.delete({ where: { id } })

    if (teacher.userId) {
      await prismaBase.user.deleteMany({ where: { id: teacher.userId, academyId } }).catch(() => undefined)
    }

    revalidateTeacherPaths(id)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Teacher not found.' }
    }
    console.error('deleteTeacher failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}

export async function resetTeacherPassword(
  teacherId: string,
): Promise<ActionResult<{ username: string; temporaryPassword: string }>> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const teacher = await db.teacher.findUnique({
    where: { id: teacherId },
    select: { userId: true, email: true, firstName: true, lastName: true },
  })

  if (!teacher) {
    return { success: false, error: 'Teacher not found.' }
  }

  try {
    if (!teacher.userId) {
      const login = await provisionUser({
        academyId,
        email: teacher.email,
        name: `${teacher.firstName} ${teacher.lastName}`,
        role: 'TEACHER',
      })
      await db.teacher.update({ where: { id: teacherId }, data: { userId: login.userId } })
      revalidateTeacherPaths(teacherId)
      return {
        success: true,
        data: { username: login.username, temporaryPassword: login.temporaryPassword },
      }
    }

    const reset = await resetUserPassword({ userId: teacher.userId, academyId })
    return {
      success: true,
      data: { username: reset.username, temporaryPassword: reset.temporaryPassword },
    }
  } catch (err) {
    if (err instanceof ProvisionError) {
      return { success: false, error: err.message }
    }
    console.error('resetTeacherPassword failed:', err)
    return { success: false, error: 'Could not reset password.' }
  }
}

export async function listTeachersForAcademy() {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.teacher.findMany({
    orderBy: { hiredAt: 'desc' },
    include: {
      user: { select: { id: true, role: true, email: true, mustChangePassword: true } },
    },
  })
}

export async function listStudentsForParentForm() {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.student.findMany({
    where: { isActive: true },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      instrument: true,
    },
  })
}
