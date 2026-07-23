import { getDashboardLessonStats } from '@/app/dashboard/lessons/actions'
import { DashboardClient } from './dashboard-client'
import { formatDateMedium, formatTime, toDateKey } from '@/lib/calendar'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'

export const dynamic = 'force-dynamic'

function lessonTone(
  status: string,
  start: Date,
  end: Date,
  now: number,
): 'completed' | 'ongoing' | 'upcoming' {
  if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW') {
    return 'completed'
  }
  if (start.getTime() <= now && end.getTime() >= now) return 'ongoing'
  return 'upcoming'
}

export default async function DashboardPage() {
  let lessonData: Awaited<ReturnType<typeof getDashboardLessonStats>> | null = null

  try {
    lessonData = await getDashboardLessonStats()
  } catch (err) {
    console.error('Dashboard lesson stats failed:', err)
  }

  const now = Date.now()

  const todaysLessons =
    lessonData?.todaysLessons.map((l) => {
      const start = l.startTime
      const end = l.endTime
      const tone = lessonTone(l.status, start, end, now)
      return {
        id: l.id,
        instrument: l.enrollment.course.instrument,
        courseName: l.enrollment.course.name,
        courseColor: l.enrollment.course.color,
        status: l.status,
        startLabel: formatTime(start),
        endLabel: formatTime(end),
        statusLabel:
          tone === 'ongoing'
            ? 'In progress'
            : LESSON_STATUS_LABELS[l.status as LessonStatusValue] ?? l.status,
        tone,
        studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
        teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
      }
    }) ?? []

  const upcomingLessons =
    lessonData?.upcomingLessons.map((l) => ({
      id: l.id,
      instrument: l.enrollment.course.instrument,
      courseName: l.enrollment.course.name,
      courseColor: l.enrollment.course.color,
      timeLabel: formatTime(l.startTime),
      dateLabel: formatDateMedium(l.startTime),
      studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
      teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
    })) ?? []

  const recentLessons =
    lessonData?.recentLessons.map((l) => ({
      id: l.id,
      instrument: l.enrollment.course.instrument,
      courseName: l.enrollment.course.name,
      status: l.status,
      statusLabel: LESSON_STATUS_LABELS[l.status as LessonStatusValue] ?? l.status,
      dateLabel: l.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeLabel: formatTime(l.startTime),
      studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
      teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
    })) ?? []

  const todayCalendarHref = `/dashboard/calendar?week=${toDateKey(new Date())}`
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <DashboardClient
      todaysLessons={todaysLessons}
      upcomingLessons={upcomingLessons}
      recentLessons={recentLessons}
      completedToday={lessonData?.completedToday ?? 0}
      cancelledToday={lessonData?.cancelledToday ?? 0}
      todayCalendarHref={todayCalendarHref}
      todayLabel={todayLabel}
    />
  )
}
