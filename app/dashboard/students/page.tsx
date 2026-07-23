import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { StudentsTable, type StudentRow } from './students-table'

// Always fetch fresh — student rosters change often and this is an
// internal dashboard, not a page we want cached across academies.
export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const students = await db.student.findMany({
    orderBy: { enrolledAt: 'desc' },
    include: {
      // NOTE: the schema has no direct Student -> Teacher assignment field.
      // A student's "teacher" only exists via their Lesson records, so we
      // derive a display value from the most recent lesson. If you want a
      // stable "primary teacher" per student instead, that likely wants a
      // dedicated column/relation on Student rather than being inferred
      // from lesson history — flag if you'd like help adding that.
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
    teacher: s.lessons[0]?.teacher ? `${s.lessons[0].teacher.firstName} ${s.lessons[0].teacher.lastName}` : null,
    isActive: s.isActive,
    joined: s.enrolledAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }))

  return <StudentsTable students={rows} />
}
