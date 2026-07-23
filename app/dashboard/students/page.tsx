import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { StudentsTable, type StudentRow } from './students-table'

// Always fetch fresh — student rosters change often and this is an
// internal dashboard, not a page we want cached across academies.
export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
  try {
    const { academyId } = await requireAcademyId()
    const db = forAcademy(academyId)

    const students = await db.student.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: {
        // Teacher is derived from active enrollments (Course architecture).
        enrollments: {
          where: { status: 'ACTIVE' },
          take: 1,
          orderBy: { startDate: 'desc' },
          include: { teacher: { select: { firstName: true, lastName: true } } },
        },
      },
    })

    const rows: StudentRow[] = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      instrument: s.instrument,
      level: s.level,
      teacher: s.enrollments[0]?.teacher
        ? `${s.enrollments[0].teacher.firstName} ${s.enrollments[0].teacher.lastName}`
        : null,
      isActive: s.isActive,
      joined: s.enrolledAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }))

    return <StudentsTable students={rows} />
  } catch (err) {
    console.error('StudentsPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load students.</p>
        <p className="text-sm text-muted-foreground">
          Please refresh the page or try again in a moment.
        </p>
      </div>
    )
  }
}
