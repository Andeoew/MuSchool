import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getCourse } from '../actions'
import { CourseDetailActions } from './course-detail-actions'
import { formatTime } from '@/lib/calendar'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'
import { ENROLLMENT_STATUS_LABELS, type EnrollmentStatusValue } from '@/lib/validations/enrollment'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function formatFee(fee: number | null) {
  if (fee == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(fee)
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCourse(id)
  if (!data) notFound()

  const { course, upcomingLessons, recentLessons, lessonStats } = data
  const teachers = Array.from(
    new Map(
      course.enrollments.map((e) => [
        e.teacher.id,
        e.teacher,
      ]),
    ).values(),
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to courses
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
            <h2 className="text-xl font-bold text-foreground tracking-tight">{course.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{course.instrument}</p>
        </div>
        <CourseDetailActions
          course={{
            id: course.id,
            name: course.name,
            instrument: course.instrument,
            defaultDuration: course.defaultDuration,
            defaultLessonFee: course.defaultLessonFee,
            description: course.description,
            color: course.color,
            isActive: course.isActive,
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Duration" value={`${course.defaultDuration} min`} />
        <InfoCard label="Default fee" value={formatFee(course.defaultLessonFee)} />
        <InfoCard label="Status" value={course.isActive ? 'Active' : 'Inactive'} />
        <InfoCard label="Enrollments" value={String(course.enrollments.length)} />
      </div>

      {course.description && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-4 gap-4">
        <InfoCard label="Total lessons" value={String(lessonStats.total)} />
        <InfoCard label="Planned" value={String(lessonStats.planned)} />
        <InfoCard label="Completed" value={String(lessonStats.completed)} />
        <InfoCard label="Cancelled" value={String(lessonStats.cancelled)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Teachers</h3>
        {teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {teachers.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/teachers/${t.id}`}
                  className="text-sm text-foreground hover:text-gold"
                >
                  {t.firstName} {t.lastName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Students enrolled</h3>
        {course.enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enrollments yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {course.enrollments.map((e) => (
              <li key={e.id} className="text-sm flex justify-between gap-3">
                <Link href={`/dashboard/students/${e.student.id}`} className="hover:text-gold">
                  {e.student.firstName} {e.student.lastName}
                </Link>
                <span className="text-muted-foreground text-[12px]">
                  {e.teacher.firstName} {e.teacher.lastName} ·{' '}
                  {ENROLLMENT_STATUS_LABELS[e.status as EnrollmentStatusValue]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LessonSection title="Upcoming lessons" lessons={upcomingLessons} empty="No upcoming lessons." />
      <LessonSection title="Recent lessons" lessons={recentLessons} empty="No recent lessons." />
    </div>
  )
}

function LessonSection({
  title,
  empty,
  lessons,
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
      teacher: { firstName: string; lastName: string }
    }
  }>
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lessons.map((l) => (
            <li key={l.id} className="text-sm flex justify-between gap-3">
              <Link href={`/dashboard/lessons/${l.id}`} className="hover:text-gold min-w-0">
                {l.enrollment.student.firstName} {l.enrollment.student.lastName}
                <span className="text-muted-foreground">
                  {' '}
                  · {l.enrollment.teacher.firstName} {l.enrollment.teacher.lastName}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {LESSON_STATUS_LABELS[l.status as LessonStatusValue]} · {formatTime(l.startTime)}–
                  {formatTime(l.endTime)}
                </span>
              </Link>
              <span className="text-muted-foreground shrink-0">{l.startTime.toLocaleDateString()}</span>
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
      <p className={cn('text-sm font-semibold text-foreground mt-1')}>{value}</p>
    </div>
  )
}
