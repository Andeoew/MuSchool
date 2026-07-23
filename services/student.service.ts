// services/student.service.ts
// Server-side data access layer for Students.
// Uncomment db calls once DATABASE_URL is configured.

import type { Student } from '@/types'

// import { db } from '@/lib/db'

export async function getStudents(): Promise<Student[]> {
  // return db.student.findMany({ orderBy: { lastName: 'asc' } })
  return []
}

export async function getStudentById(id: string): Promise<Student | null> {
  // return db.student.findUnique({ where: { id } })
  return null
}

export async function createStudent(data: Omit<Student, 'id' | 'enrolledAt'>): Promise<Student> {
  // return db.student.create({ data })
  throw new Error('Database not connected. Set DATABASE_URL and run prisma migrate dev.')
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  // return db.student.update({ where: { id }, data })
  throw new Error('Database not connected.')
}

export async function deleteStudent(id: string): Promise<void> {
  // await db.student.delete({ where: { id } })
  throw new Error('Database not connected.')
}
