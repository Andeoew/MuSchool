'use server'

// actions/student.actions.ts — Server Actions for student management
// These are ready to wire up once the database is connected.

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const StudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  instrument: z.string().optional(),
  level: z.string().optional(),
})

export async function createStudentAction(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = StudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  // TODO: await createStudent(parsed.data)
  revalidatePath('/dashboard/students')
  return { success: true }
}

export async function deleteStudentAction(id: string) {
  // TODO: await deleteStudent(id)
  revalidatePath('/dashboard/students')
  return { success: true }
}
