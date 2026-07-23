'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { forAcademy } from '@/lib/tenant-db'
import { withAcademyTransaction } from '@/lib/tenant-transaction'
import { prismaBase } from '@/lib/tenant-prisma'
import { requireAcademyId, requireAdminSession } from '@/lib/session'
import {
  provisionUser,
  resetUserPassword,
  deleteProvisionedUser,
  ProvisionError,
  type ProvisionCredentials,
} from '@/lib/services/provision-user'
import {
  createStudentWithParentSchema,
  studentUpdateSchema,
  type ParentInlineInput,
} from '@/lib/validations/student'

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

function toIssued(label: string, creds: ProvisionCredentials): IssuedLogin {
  return {
    label,
    username: creds.username,
    temporaryPassword: creds.temporaryPassword,
  }
}

async function compensateStudentCreate(opts: {
  academyId: string
  studentId: string
  parentId: string | null
  parentWasCreated: boolean
  provisionedEmails: string[]
}) {
  const db = forAcademy(opts.academyId)

  await db.parentStudent.deleteMany({ where: { studentId: opts.studentId } })
  await db.student.delete({ where: { id: opts.studentId } }).catch(() => undefined)

  if (opts.parentWasCreated && opts.parentId) {
    const remaining = await db.parentStudent.count({ where: { parentId: opts.parentId } })
    if (remaining === 0) {
      await db.parent.delete({ where: { id: opts.parentId } }).catch(() => undefined)
    }
  }

  for (const email of opts.provisionedEmails) {
    await deleteProvisionedUser({ email, academyId: opts.academyId })
  }
}

export async function createStudent(
  input: unknown,
): Promise<ActionResult<{ id: string; credentials?: IssuedLogin[] }>> {
  const parsed = createStudentWithParentSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: flattenFieldErrors(parsed.error),
    }
  }

  const { academyId } = await requireAcademyId()
  const { parent: parentInput, createLoginAccount, ...studentData } = parsed.data

  let studentId = ''
  let parentId: string | null = null
  let parentWasCreated = false
  const provisionedEmails: string[] = []
  const credentials: IssuedLogin[] = []

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
    const db = forAcademy(academyId)

    if (createLoginAccount && studentData.email) {
      const login = await provisionUser({
        academyId,
        email: studentData.email,
        name: `${studentData.firstName} ${studentData.lastName}`,
        role: 'STUDENT',
      })
      provisionedEmails.push(studentData.email)
      await db.student.update({ where: { id: studentId }, data: { userId: login.userId } })
      credentials.push(toIssued('Student login', login))
    }

    if (parentInput?.createLoginAccount && domain.parent && !domain.parent.userId) {
      const login = await provisionUser({
        academyId,
        email: domain.parent.email,
        name: `${domain.parent.firstName} ${domain.parent.lastName}`,
        role: 'PARENT',
      })
      provisionedEmails.push(domain.parent.email)
      await db.parent.update({ where: { id: domain.parent.id }, data: { userId: login.userId } })
      credentials.push(toIssued('Parent login', login))
    }

    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard/parents')
    revalidatePath('/admin/parents')

    return {
      success: true,
      data: {
        id: studentId,
        credentials: credentials.length ? credentials : undefined,
      },
    }
  } catch (err) {
    if (studentId) {
      await compensateStudentCreate({
        academyId,
        studentId,
        parentId,
        parentWasCreated,
        provisionedEmails,
      })
    }

    if (err instanceof ProvisionError && err.code === 'DUPLICATE_EMAIL') {
      return { success: false, error: err.message }
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
    const student = await db.student.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })
    if (!student) {
      return { success: false, error: 'Student not found.' }
    }

    await db.student.delete({ where: { id } })

    if (student.userId) {
      await prismaBase.user.deleteMany({ where: { id: student.userId, academyId } }).catch(() => undefined)
    }

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

export async function resetStudentPassword(
  studentId: string,
): Promise<ActionResult<{ username: string; temporaryPassword: string }>> {
  await requireAdminSession()
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { userId: true, email: true, firstName: true, lastName: true },
  })

  if (!student) {
    return { success: false, error: 'Student not found.' }
  }

  try {
    let userId = student.userId
    if (!userId) {
      if (!student.email) {
        return { success: false, error: 'Student has no email — cannot create a login account.' }
      }
      const login = await provisionUser({
        academyId,
        email: student.email,
        name: `${student.firstName} ${student.lastName}`,
        role: 'STUDENT',
      })
      await db.student.update({ where: { id: studentId }, data: { userId: login.userId } })
      revalidatePath('/dashboard/students')
      revalidatePath(`/dashboard/students/${studentId}`)
      return {
        success: true,
        data: { username: login.username, temporaryPassword: login.temporaryPassword },
      }
    }

    const reset = await resetUserPassword({ userId, academyId })
    return {
      success: true,
      data: { username: reset.username, temporaryPassword: reset.temporaryPassword },
    }
  } catch (err) {
    if (err instanceof ProvisionError) {
      return { success: false, error: err.message }
    }
    console.error('resetStudentPassword failed:', err)
    return { success: false, error: 'Could not reset password.' }
  }
}
