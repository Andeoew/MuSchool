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
        // NOTE: the schema has no direct Student -> Teacher assignment field.
        // A student's "teacher" only exists via their Lesson records, so we
        // derive a display value from the most recent lesson.
        lessons: {
          orderBy: { startTime: 'desc' },
          take: 1,
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
      teacher: s.lessons[0]?.teacher
        ? `${s.lessons[0].teacher.firstName} ${s.lessons[0].teacher.lastName}`
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
