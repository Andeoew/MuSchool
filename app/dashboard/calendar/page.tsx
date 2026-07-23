import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import {
  endOfWeek,
  formatWeekLabel,
  parseDateKey,
  startOfWeek,
  toDateKey,
} from '@/lib/calendar'
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
  const todayKey = toDateKey(new Date())
  const weekLabel = formatWeekLabel(weekStart)

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
        enrollment: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            teacher: { select: { id: true, firstName: true, lastName: true } },
            course: {
              select: {
                id: true,
                name: true,
                instrument: true,
                color: true,
                defaultDuration: true,
              },
            },
          },
        },
      },
    })

    const lessons: CalendarLesson[] = rows.map((l) => ({
      id: l.id,
      enrollmentId: l.enrollmentId,
      room: l.room,
      notes: l.notes,
      status: l.status,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime.toISOString(),
      student: l.enrollment.student,
      teacher: l.enrollment.teacher,
      course: l.enrollment.course,
    }))

    return (
      <CalendarWeekView
        weekStartKey={weekStartKey}
        weekLabel={weekLabel}
        todayKey={todayKey}
        lessons={lessons}
      />
    )
  } catch (err) {
    console.error('CalendarPage failed:', err)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-[1400px]">
        <p className="text-sm font-medium text-foreground">Could not load calendar.</p>
        <p className="text-sm text-muted-foreground">Please refresh the page or try again.</p>
      </div>
    )
  }
}
