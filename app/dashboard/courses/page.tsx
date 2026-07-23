import { listCourses } from './actions'
import { CoursesTable, type CourseRow } from './courses-table'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  try {
    const courses = await listCourses()
    const rows: CourseRow[] = courses.map((c) => ({
      id: c.id,
      name: c.name,
      instrument: c.instrument,
      defaultDuration: c.defaultDuration,
      defaultLessonFee: c.defaultLessonFee,
      description: c.description,
      color: c.color,
      isActive: c.isActive,
      teacherCount: c.teacherCount,
      studentCount: c.studentCount,
    }))
    return <CoursesTable courses={rows} />
  } catch (err) {
    console.error('CoursesPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load courses.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again.</p>
      </div>
    )
  }
}
