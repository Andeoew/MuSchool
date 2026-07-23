import { listTeachersForAcademy } from '@/actions/teacher'
import { TeachersTable, type TeacherRow } from '@/app/dashboard/teachers/teachers-table'

export const dynamic = 'force-dynamic'

/** Admin alias — same production Teacher CRUD as /dashboard/teachers. */
export default async function AdminTeachersPage() {
  const teachers = await listTeachersForAcademy()

  const rows: TeacherRow[] = teachers.map((teacher) => ({
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    phone: teacher.phone,
    instruments: teacher.instruments,
    isActive: teacher.isActive,
    hasLogin: Boolean(teacher.userId),
    hiredAt: teacher.hiredAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }))

  return <TeachersTable teachers={rows} />
}
