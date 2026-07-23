'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { forAcademy } from '@/lib/tenant-db'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAdminSession, requireAcademyId } from '@/lib/session'
import { createTeacherSchema } from '@/lib/validations/teacher'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
}

export async function createTeacher(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdminSession()

  const parsed = createTeacherSchema.safeParse(input)
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

  try {
    await auth.api.signUpEmail({
      body: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.tempPassword,
        role: 'TEACHER',
        academyId,
      },
    })
  } catch (err) {
    if (isUniqueConstraintError(err) || /already exists|duplicate/i.test(String(err))) {
      return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor.' }
    }
    console.error('createTeacher signUp failed:', err)
    return { success: false, error: 'Eğitmen hesabı oluşturulamadı.' }
  }

  try {
    const user = await prismaBase.user.findFirst({
      where: { email: data.email, academyId },
      select: { id: true },
    })

    if (!user) {
      return { success: false, error: 'Kullanıcı kaydı oluşturuldu ancak eğitmen profili bağlanamadı.' }
    }

    const teacher = await db.teacher.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        instruments: [data.instrument],
        userId: user.id,
      },
    })

    revalidatePath('/admin/teachers')
    revalidatePath('/dashboard/teachers')

    return { success: true, data: { id: teacher.id } }
  } catch (err) {
    await prismaBase.user.deleteMany({ where: { email: data.email, academyId } }).catch(() => undefined)

    if (isUniqueConstraintError(err)) {
      return { success: false, error: 'Bu e-posta adresi zaten bir eğitmen olarak kayıtlı.' }
    }

    console.error('createTeacher failed:', err)
    return { success: false, error: 'Eğitmen kaydedilirken bir hata oluştu.' }
  }
}

export async function listTeachersForAcademy() {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  return db.teacher.findMany({
    orderBy: { hiredAt: 'desc' },
    include: {
      user: { select: { id: true, role: true } },
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
