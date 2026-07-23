'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { studentInputSchema, studentUpdateSchema } from '@/lib/validations/student'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

function isNotFoundError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
}

export async function createStudent(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = studentInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    const student = await db.student.create({ data: parsed.data })
    revalidatePath('/dashboard/students')
    return { success: true, data: { id: student.id } }
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'A student with this email is already enrolled at your academy.' }
    }
    console.error('createStudent failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function updateStudent(id: string, input: unknown): Promise<ActionResult> {
  const parsed = studentUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please check the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    await db.student.update({ where: { id }, data: parsed.data })
    revalidatePath('/dashboard/students')
    revalidatePath(`/dashboard/students/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Student not found.' }
    }
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'A student with this email is already enrolled at your academy.' }
    }
    console.error('updateStudent failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

export async function deleteStudent(id: string): Promise<ActionResult> {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    await db.student.delete({ where: { id } })
    revalidatePath('/dashboard/students')
    revalidatePath(`/dashboard/students/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Student not found.' }
    }
    console.error('deleteStudent failed:', err)
    return { success: false, error: 'Something went wrong while deleting. Please try again.' }
  }
}
