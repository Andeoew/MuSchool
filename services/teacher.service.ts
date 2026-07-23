// services/teacher.service.ts

import type { Teacher } from '@/types'

// import { db } from '@/lib/db'

export async function getTeachers(): Promise<Teacher[]> {
  // return db.teacher.findMany({ orderBy: { lastName: 'asc' } })
  return []
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  // return db.teacher.findUnique({ where: { id } })
  return null
}
