import { listParentsForAcademy } from '@/actions/parent'
import { ParentsTable, type ParentRow } from '@/app/admin/parents/parents-table'

export const dynamic = 'force-dynamic'

export default async function DashboardParentsPage() {
  try {
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
  } catch (err) {
    console.error('DashboardParentsPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load parents.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again.</p>
      </div>
    )
  }
}
