'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { withAcademyTransaction } from '@/lib/tenant-transaction'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAdminSession, requireAcademyId } from '@/lib/session'
import {
  provisionUser,
  resetUserPassword,
  deleteProvisionedUser,
  ProvisionError,
} from '@/lib/services/provision-user'
import {
  createParentSchema,
  updateParentSchema,
  linkParentToStudentsSchema,
} from '@/lib/validations/parent'

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

function revalidateParentPaths() {
  revalidatePath('/admin/parents')
  revalidatePath('/dashboard/parents')
  revalidatePath('/dashboard/students')
}

export async function createParentWithStudents(
  input: unknown,
): Promise<ActionResult<{ id: string; credentials?: IssuedLogin[] }>> {
  await requireAdminSession()

  const parsed = createParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Lütfen formu kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data
  let provisionedEmail: string | null = null

  const students = await db.student.findMany({
    where: { id: { in: data.studentIds } },
    select: { id: true },
  })

  if (students.length !== data.studentIds.length) {
    return { success: false, error: 'Seçilen öğrencilerden biri veya birkaçı bulunamadı.' }
  }

  try {
    const parent = await withAcademyTransaction(academyId, async (tx, scopedAcademyId) => {
      let existing = await tx.parent.findUnique({
        where: { academyId_email: { academyId: scopedAcademyId, email: data.email } },
      })

      if (!existing) {
        existing = await tx.parent.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone ?? null,
            academyId: scopedAcademyId,
          },
        })
      }

      for (const studentId of data.studentIds) {
        const link = await tx.parentStudent.findUnique({
          where: { parentId_studentId: { parentId: existing.id, studentId } },
        })
        if (!link) {
          await tx.parentStudent.create({
            data: {
              parentId: existing.id,
              studentId,
              relationship: data.relationship ?? null,
              academyId: scopedAcademyId,
            },
          })
        }
      }

      return existing
    })

    let credentials: IssuedLogin[] | undefined
    const wantsLogin = data.createLoginAccount !== false

    if (wantsLogin && !parent.userId) {
      const login = await provisionUser({
        academyId,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        role: 'PARENT',
      })
      provisionedEmail = data.email
      await db.parent.update({
        where: { id: parent.id },
        data: { userId: login.userId },
      })
      credentials = [
        {
          label: 'Parent login',
          username: login.username,
          temporaryPassword: login.temporaryPassword,
        },
      ]
    }

    revalidateParentPaths()
    return { success: true, data: { id: parent.id, credentials } }
  } catch (err) {
    if (provisionedEmail) {
      await deleteProvisionedUser({ email: provisionedEmail, academyId })
    }

    if (err instanceof ProvisionError && err.code === 'DUPLICATE_EMAIL') {
      return { success: false, error: err.message }
    }

    if (isUniqueConstraintError(err) || /already exists|duplicate/i.test(String(err))) {
      return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor.' }
    }

    console.error('createParentWithStudents failed:', err)
    return { success: false, error: 'Veli kaydedilirken bir hata oluştu.' }
  }
}

export async function updateParent(id: string, input: unknown): Promise<ActionResult> {
  await requireAdminSession()

  const parsed = updateParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Lütfen formu kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    await db.parent.update({
      where: { id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
      },
    })
    revalidateParentPaths()
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Veli bulunamadı.' }
    }
    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Bu e-posta adresi zaten bir veli olarak kayıtlı.' }
    }
    console.error('updateParent failed:', err)
    return { success: false, error: 'Veli güncellenirken bir hata oluştu.' }
  }
}

export async function deleteParent(id: string): Promise<ActionResult> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    const parent = await db.parent.findUnique({
      where: { id },
      select: { id: true, userId: true, email: true },
    })

    if (!parent) {
      return { success: false, error: 'Veli bulunamadı.' }
    }

    await db.parentStudent.deleteMany({ where: { parentId: id } })
    await db.parent.delete({ where: { id } })

    if (parent.userId) {
      await prismaBase.user.deleteMany({ where: { id: parent.userId, academyId } }).catch(() => undefined)
    }

    revalidateParentPaths()
    return { success: true, data: undefined }
  } catch (err) {
    if (isNotFoundError(err)) {
      return { success: false, error: 'Veli bulunamadı.' }
    }
    console.error('deleteParent failed:', err)
    return { success: false, error: 'Veli silinirken bir hata oluştu.' }
  }
}

export async function linkParentToStudents(input: unknown): Promise<ActionResult> {
  await requireAdminSession()

  const parsed = linkParentToStudentsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Lütfen formu kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const { parentId, studentIds, relationship } = parsed.data

  const parent = await db.parent.findUnique({ where: { id: parentId }, select: { id: true } })
  if (!parent) {
    return { success: false, error: 'Veli bulunamadı.' }
  }

  const students = await db.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true },
  })
  if (students.length !== studentIds.length) {
    return { success: false, error: 'Seçilen öğrencilerden biri veya birkaçı bulunamadı.' }
  }

  try {
    await withAcademyTransaction(academyId, async (tx, scopedAcademyId) => {
      for (const studentId of studentIds) {
        const existing = await tx.parentStudent.findUnique({
          where: { parentId_studentId: { parentId, studentId } },
        })
        if (!existing) {
          await tx.parentStudent.create({
            data: {
              parentId,
              studentId,
              relationship: relationship ?? null,
              academyId: scopedAcademyId,
            },
          })
        }
      }
    })

    revalidateParentPaths()
    return { success: true, data: undefined }
  } catch (err) {
    console.error('linkParentToStudents failed:', err)
    return { success: false, error: 'Öğrenci eşleştirilirken bir hata oluştu.' }
  }
}

export async function resetParentPassword(
  parentId: string,
): Promise<ActionResult<{ username: string; temporaryPassword: string }>> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const parent = await db.parent.findUnique({
    where: { id: parentId },
    select: { userId: true, email: true, firstName: true, lastName: true },
  })

  if (!parent) {
    return { success: false, error: 'Veli bulunamadı.' }
  }

  try {
    if (!parent.userId) {
      const login = await provisionUser({
        academyId,
        email: parent.email,
        name: `${parent.firstName} ${parent.lastName}`,
        role: 'PARENT',
      })
      await db.parent.update({ where: { id: parentId }, data: { userId: login.userId } })
      revalidateParentPaths()
      return {
        success: true,
        data: { username: login.username, temporaryPassword: login.temporaryPassword },
      }
    }

    const reset = await resetUserPassword({ userId: parent.userId, academyId })
    return {
      success: true,
      data: { username: reset.username, temporaryPassword: reset.temporaryPassword },
    }
  } catch (err) {
    if (err instanceof ProvisionError) {
      return { success: false, error: err.message }
    }
    console.error('resetParentPassword failed:', err)
    return { success: false, error: 'Parola sıfırlanamadı.' }
  }
}

export async function listParentsForAcademy() {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.parent.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true } },
      students: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              instrument: true,
            },
          },
        },
      },
    },
  })
}
