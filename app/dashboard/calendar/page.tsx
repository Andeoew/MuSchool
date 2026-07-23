import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { endOfWeek, parseDateKey, startOfWeek, toDateKey } from '@/lib/calendar'
import { CalendarWeekView, type CalendarLesson } from './calendar-week-view'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ week?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const parsed = params.week ? parseDateKey(params.week) : null
  const weekStart = startOfWeek(parsed ?? new Date())
  const weekEnd = endOfWeek(weekStart)
  const weekStartKey = toDateKey(weekStart)

  try {
    const { academyId } = await requireAcademyId()
    const db = forAcademy(academyId)

    const rows = await db.lesson.findMany({
      where: {
        startTime: { gte: weekStart, lt: weekEnd },
        status: { not: 'CANCELLED' },
      },
      orderBy: { startTime: 'asc' },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, instrument: true },
        },
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    const lessons: CalendarLesson[] = rows.map((l) => ({
      id: l.id,
      instrument: l.instrument,
      level: l.level,
      lessonType: l.lessonType,
      room: l.room,
      lessonFee: l.lessonFee,
      notes: l.notes,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime.toISOString(),
      status: l.status,
      student: l.student,
      teacher: l.teacher,
    }))

    return <CalendarWeekView weekStartKey={weekStartKey} lessons={lessons} />
  } catch (err) {
    console.error('CalendarPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load calendar.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again in a moment.</p>
      </div>
    )
  }
}
