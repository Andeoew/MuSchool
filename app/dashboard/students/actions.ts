'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { forAcademy } from '@/lib/tenant-db'
import { withAcademyTransaction } from '@/lib/tenant-transaction'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAcademyId } from '@/lib/session'
import { generateTempPassword } from '@/lib/password'
import {
  createStudentWithParentSchema,
  studentUpdateSchema,
  type ParentInlineInput,
} from '@/lib/validations/student'

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

async function createParentLoginAccount(opts: {
  academyId: string
  parentId: string
  email: string
  firstName: string
  lastName: string
}): Promise<{ userId: string; temporaryPassword: string }> {
  const temporaryPassword = generateTempPassword()

  await auth.api.signUpEmail({
    body: {
      name: `${opts.firstName} ${opts.lastName}`,
      email: opts.email,
      password: temporaryPassword,
      role: 'PARENT',
      academyId: opts.academyId,
      mustChangePassword: true,
    },
  })

  const user = await prismaBase.user.findFirst({
    where: { email: opts.email, academyId: opts.academyId },
    select: { id: true },
  })

  if (!user) {
    throw new Error('Parent user was created but could not be loaded.')
  }

  // Ensure flag is set even if Better Auth ignored the additional field.
  await prismaBase.user.update({
    where: { id: user.id },
    data: { mustChangePassword: true },
  })

  const db = forAcademy(opts.academyId)
  await db.parent.update({
    where: { id: opts.parentId },
    data: { userId: user.id },
  })

  return { userId: user.id, temporaryPassword }
}

async function compensateStudentCreate(opts: {
  academyId: string
  studentId: string
  parentId: string | null
  parentWasCreated: boolean
  createdUserEmail: string | null
}) {
  const db = forAcademy(opts.academyId)

  await db.parentStudent.deleteMany({
    where: { studentId: opts.studentId },
  })

  await db.student.delete({ where: { id: opts.studentId } }).catch(() => undefined)

  if (opts.parentWasCreated && opts.parentId) {
    const remaining = await db.parentStudent.count({ where: { parentId: opts.parentId } })
    if (remaining === 0) {
      await db.parent.delete({ where: { id: opts.parentId } }).catch(() => undefined)
    }
  }

  if (opts.createdUserEmail) {
    await prismaBase.user
      .deleteMany({ where: { email: opts.createdUserEmail, academyId: opts.academyId } })
      .catch(() => undefined)
  }
}

export async function createStudent(
  input: unknown,
): Promise<ActionResult<{ id: string; temporaryPassword?: string }>> {
  const parsed = createStudentWithParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const { parent: parentInput, ...studentData } = parsed.data

  let studentId = ''
  let parentId: string | null = null
  let parentWasCreated = false
  let temporaryPassword: string | undefined

  try {
    const domain = await withAcademyTransaction(academyId, async (tx, scopedAcademyId) => {
      const student = await tx.student.create({
        data: {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email ?? null,
          phone: studentData.phone ?? null,
          birthDate: studentData.birthDate ?? null,
          instrument: studentData.instrument ?? null,
          level: studentData.level ?? null,
          isActive: studentData.isActive,
          academyId: scopedAcademyId,
        },
      })

      if (!parentInput) {
        return { student, parent: null as null, parentWasCreated: false }
      }

      const attached = await attachParentInTx(tx, scopedAcademyId, student.id, parentInput)
      return {
        student,
        parent: attached.parent,
        parentWasCreated: attached.parentWasCreated,
      }
    })

    studentId = domain.student.id
    parentId = domain.parent?.id ?? null
    parentWasCreated = domain.parentWasCreated

    if (parentInput?.createLoginAccount && domain.parent && !domain.parent.userId) {
      const login = await createParentLoginAccount({
        academyId,
        parentId: domain.parent.id,
        email: domain.parent.email,
        firstName: domain.parent.firstName,
        lastName: domain.parent.lastName,
      })
      temporaryPassword = login.temporaryPassword
    }

    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard/parents')
    revalidatePath('/admin/parents')

    return {
      success: true,
      data: { id: studentId, temporaryPassword },
    }
  } catch (err) {
    if (studentId) {
      await compensateStudentCreate({
        academyId,
        studentId,
        parentId,
        parentWasCreated,
        createdUserEmail: parentInput?.createLoginAccount ? parentInput.email : null,
      })
    }

    if (isUniqueConstraintError(err)) {
      return {
        success: false,
        error: 'A student or parent with this email is already registered at your academy.',
      }
    }

    const message = err instanceof Error ? err.message : String(err)
    if (/already exists|duplicate|unique/i.test(message)) {
      return { success: false, error: 'This email is already in use.' }
    }

    console.error('createStudent failed:', err)
    return { success: false, error: 'Something went wrong while saving. Please try again.' }
  }
}

async function attachParentInTx(
  tx: Prisma.TransactionClient,
  academyId: string,
  studentId: string,
  parentInput: ParentInlineInput,
) {
  const existing = await tx.parent.findUnique({
    where: {
      academyId_email: { academyId, email: parentInput.email },
    },
  })

  let parent = existing
  let parentWasCreated = false

  if (!parent) {
    parent = await tx.parent.create({
      data: {
        firstName: parentInput.firstName,
        lastName: parentInput.lastName,
        email: parentInput.email,
        phone: parentInput.phone ?? null,
        academyId,
      },
    })
    parentWasCreated = true
  }

  const existingLink = await tx.parentStudent.findUnique({
    where: {
      parentId_studentId: { parentId: parent.id, studentId },
    },
  })

  if (!existingLink) {
    await tx.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId,
        relationship: parentInput.relationship,
        academyId,
      },
    })
  } else if (!existingLink.relationship && parentInput.relationship) {
    await tx.parentStudent.update({
      where: { id: existingLink.id },
      data: { relationship: parentInput.relationship },
    })
  }

  return { parent, parentWasCreated }
}

export async function updateStudent(id: string, input: unknown): Promise<ActionResult> {
  const parsed = studentUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  try {
    await db.student.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email === undefined ? undefined : parsed.data.email ?? null,
        phone: parsed.data.phone === undefined ? undefined : parsed.data.phone ?? null,
        birthDate: parsed.data.birthDate === undefined ? undefined : parsed.data.birthDate ?? null,
        instrument: parsed.data.instrument === undefined ? undefined : parsed.data.instrument ?? null,
        level: parsed.data.level === undefined ? undefined : parsed.data.level ?? null,
      },
    })
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
