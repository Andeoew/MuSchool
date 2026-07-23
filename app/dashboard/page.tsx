import { getDashboardLessonStats } from '@/app/dashboard/lessons/actions'
import { DashboardClient } from './dashboard-client'
import { toDateKey } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let lessonData: Awaited<ReturnType<typeof getDashboardLessonStats>> | null = null

  try {
    lessonData = await getDashboardLessonStats()
  } catch (err) {
    console.error('Dashboard lesson stats failed:', err)
  }

  const todaysLessons =
    lessonData?.todaysLessons.map((l) => ({
      id: l.id,
      instrument: l.enrollment.course.instrument,
      courseName: l.enrollment.course.name,
      courseColor: l.enrollment.course.color,
      status: l.status,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime.toISOString(),
      studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
      teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
    })) ?? []

  const upcomingLessons =
    lessonData?.upcomingLessons.map((l) => ({
      id: l.id,
      instrument: l.enrollment.course.instrument,
      courseName: l.enrollment.course.name,
      courseColor: l.enrollment.course.color,
      startTime: l.startTime.toISOString(),
      studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
      teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
    })) ?? []

  const recentLessons =
    lessonData?.recentLessons.map((l) => ({
      id: l.id,
      instrument: l.enrollment.course.instrument,
      courseName: l.enrollment.course.name,
      status: l.status,
      startTime: l.startTime.toISOString(),
      studentName: `${l.enrollment.student.firstName} ${l.enrollment.student.lastName}`,
      teacherName: `${l.enrollment.teacher.firstName} ${l.enrollment.teacher.lastName}`,
    })) ?? []

  const todayCalendarHref = `/dashboard/calendar?view=day&date=${toDateKey(new Date())}`

  return (
    <DashboardClient
      todaysLessons={todaysLessons}
      upcomingLessons={upcomingLessons}
      recentLessons={recentLessons}
      completedToday={lessonData?.completedToday ?? 0}
      cancelledToday={lessonData?.cancelledToday ?? 0}
      todayCalendarHref={todayCalendarHref}
    />
  )
}
