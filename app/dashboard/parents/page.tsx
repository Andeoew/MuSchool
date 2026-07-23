import { listParentsForAcademy } from '@/actions/parent'
import { ParentsTable, type ParentRow } from '@/app/admin/parents/parents-table'

export const dynamic = 'force-dynamic'

export default async function DashboardParentsPage() {
  const parents = await listParentsForAcademy()

  const rows: ParentRow[] = parents.map((parent) => ({
    id: parent.id,
    firstName: parent.firstName,
    lastName: parent.lastName,
    email: parent.email,
    phone: parent.phone,
    students: parent.students.map(({ student }) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      instrument: student.instrument,
    })),
  }))

  return <ParentsTable parents={rows} />
}
