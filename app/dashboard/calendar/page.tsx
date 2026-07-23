import {
  addDays,
  endOfMonth,
  endOfWeek,
  parseDateKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateKey,
  type CalendarView,
} from '@/lib/calendar'
import {
  getCalendarFilterOptions,
  listLessonsInRange,
} from '@/app/dashboard/lessons/actions'
import { CalendarShell, type CalendarLesson } from './calendar-shell'
import type { LessonStatusValue } from '@/lib/validations/lesson'

export const dynamic = 'force-dynamic'

type SearchParams = {
  view?: string
  date?: string
  teacherId?: string
  studentId?: string
  courseId?: string
  instrument?: string
  status?: string
  q?: string
}

function resolveRange(view: CalendarView, focus: Date): { start: Date; end: Date } {
  if (view === 'day') {
    return { start: startOfDay(focus), end: addDays(startOfDay(focus), 1) }
  }
  if (view === 'month') {
    const monthStart = startOfMonth(focus)
    return { start: startOfWeek(monthStart), end: endOfWeek(addDays(endOfMonth(focus), -1)) }
  }
  const weekStart = startOfWeek(focus)
  return { start: weekStart, end: endOfWeek(weekStart) }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const view: CalendarView =
    params.view === 'day' || params.view === 'month' || params.view === 'week'
      ? params.view
      : 'week'
  const focus = params.date ? parseDateKey(params.date) ?? new Date() : new Date()
  const dateKey = toDateKey(focus)
  const { start, end } = resolveRange(view, focus)

  const status =
    params.status &&
    ['PLANNED', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'NO_SHOW'].includes(params.status)
      ? (params.status as LessonStatusValue)
      : undefined

  try {
    const [rows, filterOptions] = await Promise.all([
      listLessonsInRange(start, end, {
        teacherId: params.teacherId,
        studentId: params.studentId,
        courseId: params.courseId,
        instrument: params.instrument,
        status,
        search: params.q,
      }),
      getCalendarFilterOptions(),
    ])

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
      <CalendarShell
        view={view}
        dateKey={dateKey}
        lessons={lessons}
        teachers={filterOptions.teachers.map((t) => ({
          id: t.id,
          label: `${t.firstName} ${t.lastName}`,
        }))}
        students={filterOptions.students.map((s) => ({
          id: s.id,
          label: `${s.firstName} ${s.lastName}`,
        }))}
        courses={filterOptions.courses.map((c) => ({
          id: c.id,
          label: c.name,
          instrument: c.instrument,
        }))}
        instruments={Array.from(new Set(filterOptions.courses.map((c) => c.instrument))).sort()}
        filters={{
          teacherId: params.teacherId ?? '',
          studentId: params.studentId ?? '',
          courseId: params.courseId ?? '',
          instrument: params.instrument ?? '',
          status: params.status ?? '',
          q: params.q ?? '',
        }}
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
