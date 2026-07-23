import { getDashboardLessonStats } from '@/app/dashboard/lessons/actions'
import { DashboardClient } from './dashboard-client'

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
      instrument: l.instrument,
      status: l.status,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime.toISOString(),
      studentName: `${l.student.firstName} ${l.student.lastName}`,
      teacherName: `${l.teacher.firstName} ${l.teacher.lastName}`,
      level: l.level,
    })) ?? []

  const upcomingLessons =
    lessonData?.upcomingLessons.map((l) => ({
      id: l.id,
      instrument: l.instrument,
      startTime: l.startTime.toISOString(),
      studentName: `${l.student.firstName} ${l.student.lastName}`,
      teacherName: `${l.teacher.firstName} ${l.teacher.lastName}`,
    })) ?? []

  const recentLessons =
    lessonData?.recentLessons.map((l) => ({
      id: l.id,
      instrument: l.instrument,
      status: l.status,
      startTime: l.startTime.toISOString(),
      studentName: `${l.student.firstName} ${l.student.lastName}`,
      teacherName: `${l.teacher.firstName} ${l.teacher.lastName}`,
    })) ?? []

  return (
    <DashboardClient
      todaysLessons={todaysLessons}
      upcomingLessons={upcomingLessons}
      recentLessons={recentLessons}
      completedToday={lessonData?.completedToday ?? 0}
      cancelledToday={lessonData?.cancelledToday ?? 0}
    />
  )
}
