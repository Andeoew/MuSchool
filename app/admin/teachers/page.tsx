import { listTeachersForAcademy } from '@/actions/teacher'
import { TeachersTable, type TeacherRow } from './teachers-table'

export const dynamic = 'force-dynamic'

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
    hiredAt: teacher.hiredAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
  }))

  return <TeachersTable teachers={rows} />
}
