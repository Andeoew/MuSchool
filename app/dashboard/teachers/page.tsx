import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { formatMonthYear } from '@/lib/format-date'
import { TeachersTable, type TeacherRow } from './teachers-table'

export const dynamic = 'force-dynamic'

export default async function TeachersPage() {
  try {
    const { academyId } = await requireAcademyId()
    const db = forAcademy(academyId)

    const teachers = await db.teacher.findMany({
      orderBy: { hiredAt: 'desc' },
      include: {
        user: { select: { id: true } },
      },
    })

    const rows: TeacherRow[] = teachers.map((t) => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone,
      instruments: t.instruments,
      isActive: t.isActive,
      hasLogin: Boolean(t.userId),
      hiredAt: formatMonthYear(t.hiredAt),
    }))

    return <TeachersTable teachers={rows} />
  } catch (err) {
    console.error('TeachersPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load teachers.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again in a moment.</p>
      </div>
    )
  }
}
