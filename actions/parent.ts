'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { forAcademy } from '@/lib/tenant-db'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAdminSession, requireAcademyId } from '@/lib/session'
import { createParentSchema } from '@/lib/validations/parent'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

export async function createParentWithStudents(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession()

  const parsed = createParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Lütfen formu kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const data = parsed.data

  const students = await db.student.findMany({
    where: { id: { in: data.studentIds } },
    select: { id: true },
  })

  if (students.length !== data.studentIds.length) {
    return { success: false, error: 'Seçilen öğrencilerden biri veya birkaçı bulunamadı.' }
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.tempPassword,
        role: 'PARENT',
        academyId,
      },
    })
  } catch (err) {
    if (isUniqueConstraintError(err) || /already exists|duplicate/i.test(String(err))) {
      return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor.' }
    }
    console.error('createParent signUp failed:', err)
    return { success: false, error: 'Veli hesabı oluşturulamadı.' }
  }

  try {
    const parent = await db.parent.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
      },
    })

    await Promise.all(
      data.studentIds.map((studentId) =>
        db.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId,
          },
        })
      )
    )

    revalidatePath('/admin/parents')
    revalidatePath('/dashboard/parents')

    return { success: true, data: { id: parent.id } }
  } catch (err) {
    await prismaBase.user.deleteMany({ where: { email: data.email, academyId } }).catch(() => undefined)

    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Bu e-posta adresi zaten bir veli olarak kayıtlı.' }
    }

    console.error('createParentWithStudents failed:', err)
    return { success: false, error: 'Veli kaydedilirken bir hata oluştu.' }
  }
}

export async function listParentsForAcademy() {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.parent.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
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
