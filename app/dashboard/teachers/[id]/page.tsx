import Link from 'next/link'
import { notFound } from 'next/navigation'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { TeacherDetailActions } from './teacher-detail-actions'
import { formatTime, startOfWeek, endOfWeek } from '@/lib/calendar'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'

export const dynamic = 'force-dynamic'

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)

  const teacher = await db.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, mustChangePassword: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          course: { select: { id: true, name: true, instrument: true, color: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!teacher) notFound()

  const enrollmentIds = teacher.enrollments.map((e) => e.id)

  const [todaysLessons, upcomingLessons, recentLessons, weeklyLessonCount] = await Promise.all([
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            startTime: { gte: todayStart, lte: todayEnd },
            status: { not: 'CANCELLED' },
          },
          orderBy: { startTime: 'asc' },
          include: {
            enrollment: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                course: { select: { name: true, color: true } },
              },
            },
          },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            startTime: { gt: todayEnd },
            status: { in: ['PLANNED', 'POSTPONED'] },
          },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: {
            enrollment: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                course: { select: { name: true, color: true } },
              },
            },
          },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            OR: [
              { startTime: { lt: todayStart } },
              { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
            ],
          },
          orderBy: { startTime: 'desc' },
          take: 5,
          include: {
            enrollment: {
              include: {
                student: { select: { firstName: true, lastName: true } },
                course: { select: { name: true, color: true } },
              },
            },
          },
        }),
    enrollmentIds.length === 0
      ? Promise.resolve(0)
      : db.lesson.count({
          where: {
            enrollmentId: { in: enrollmentIds },
            startTime: { gte: weekStart, lt: weekEnd },
            status: { not: 'CANCELLED' },
          },
        }),
  ])

  const coursesTeaching = Array.from(
    new Map(teacher.enrollments.map((e) => [e.course.id, e.course])).values(),
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {teacher.firstName} {teacher.lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{teacher.email}</p>
        </div>
        <TeacherDetailActions teacher={teacher} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Instruments" value={teacher.instruments.join(', ') || '—'} />
        <InfoCard label="Phone" value={teacher.phone ?? '—'} />
        <InfoCard label="Status" value={teacher.isActive ? 'Active' : 'Inactive'} />
        <InfoCard label="Weekly lessons" value={String(weeklyLessonCount)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Courses Teaching</h3>
        {coursesTeaching.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not assigned to any courses yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {coursesTeaching.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/courses/${c.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-gold"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                  <span className="text-muted-foreground font-normal">· {c.instrument}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LessonListSection
        title="Today's Lessons"
        empty="No lessons scheduled for today."
        lessons={todaysLessons}
        viewAllHref={`/dashboard/lessons?teacherId=${id}`}
      />
      <LessonListSection
        title="Upcoming Lessons"
        empty="No upcoming lessons."
        lessons={upcomingLessons}
        viewAllHref={`/dashboard/lessons?teacherId=${id}`}
      />
      <LessonListSection
        title="Lesson History"
        empty="No lesson history yet."
        lessons={recentLessons}
        viewAllHref={`/dashboard/lessons?teacherId=${id}`}
      />
    </div>
  )
}

function LessonListSection({
  title,
  empty,
  lessons,
  viewAllHref,
}: {
  title: string
  empty: string
  lessons: Array<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    enrollment: {
      student: { firstName: string; lastName: string }
      course: { name: string; color: string }
    }
  }>
  viewAllHref: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Link href={viewAllHref} className="text-xs text-gold hover:underline underline-offset-4">
          View All Lessons
        </Link>
      </div>
      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lessons.map((l) => (
            <li key={l.id} className="text-sm flex justify-between gap-3">
              <Link href={`/dashboard/lessons/${l.id}`} className="hover:text-gold min-w-0">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: l.enrollment.course.color }}
                  />
                  {l.enrollment.course.name}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  with {l.enrollment.student.firstName} {l.enrollment.student.lastName}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {LESSON_STATUS_LABELS[l.status as LessonStatusValue]} · {formatTime(l.startTime)}–
                  {formatTime(l.endTime)}
                </span>
              </Link>
              <span className="text-muted-foreground shrink-0">
                {l.startTime.toLocaleDateString('en-US')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
    </div>
  )
}
