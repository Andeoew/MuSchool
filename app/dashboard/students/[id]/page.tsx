import Link from 'next/link'
import { notFound } from 'next/navigation'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { StudentDetailActions } from './student-detail-actions'
import { StudentEnrollmentSection } from './student-enrollment-section'
import { formatTime } from '@/lib/calendar'
import { formatDateShort } from '@/lib/format-date'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)
  const now = new Date()

  const student = await db.student.findUnique({
    where: { id },
    include: {
      parents: {
        include: {
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      enrollments: {
        orderBy: { startDate: 'desc' },
        include: {
          course: { select: { id: true, name: true, instrument: true, color: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!student) notFound()

  const enrollmentIds = student.enrollments.map((e) => e.id)

  const [upcomingLessons, recentLessons] = await Promise.all([
    enrollmentIds.length === 0
      ? Promise.resolve([])
      : db.lesson.findMany({
          where: {
            enrollmentId: { in: enrollmentIds },
            startTime: { gte: now },
            status: { in: ['PLANNED', 'POSTPONED'] },
          },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: {
            enrollment: {
              include: {
                teacher: { select: { firstName: true, lastName: true } },
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
              { startTime: { lt: now } },
              { status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
            ],
          },
          orderBy: { startTime: 'desc' },
          take: 5,
          include: {
            enrollment: {
              include: {
                teacher: { select: { firstName: true, lastName: true } },
                course: { select: { name: true, color: true } },
              },
            },
          },
        }),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{student.email ?? 'No email on file'}</p>
        </div>
        <StudentDetailActions student={student} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Instrument" value={student.instrument ?? '—'} />
        <InfoCard label="Level" value={student.level ?? '—'} />
        <InfoCard label="Phone" value={student.phone ?? '—'} />
        <InfoCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Parents / Guardians</h3>
        {student.parents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No parent linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {student.parents.map((link) => (
              <li key={link.id} className="text-sm text-foreground flex justify-between gap-3">
                <span>
                  {link.parent.firstName} {link.parent.lastName}
                  {link.relationship ? ` · ${link.relationship}` : ''}
                </span>
                <span className="text-muted-foreground">{link.parent.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <StudentEnrollmentSection
        studentId={student.id}
        studentName={`${student.firstName} ${student.lastName}`}
        enrollments={student.enrollments.map((e) => ({
          id: e.id,
          status: e.status,
          startDate: e.startDate.toISOString(),
          course: e.course,
          teacher: e.teacher,
        }))}
      />

      <LessonListSection
        title="Upcoming Lessons"
        empty="No upcoming lessons."
        lessons={upcomingLessons}
        viewAllHref={`/dashboard/lessons?studentId=${id}`}
      />

      <LessonListSection
        title="Lesson History"
        empty="No lesson history yet."
        lessons={recentLessons}
        viewAllHref={`/dashboard/lessons?studentId=${id}`}
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Payments</h3>
        {student.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment records yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {student.payments.map((p) => (
              <li key={p.id} className="text-sm text-foreground flex justify-between">
                <span>{p.description ?? p.status}</span>
                <span className="text-muted-foreground">
                  {p.amount} {p.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
      teacher: { firstName: string; lastName: string }
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
                  with {l.enrollment.teacher.firstName} {l.enrollment.teacher.lastName}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {LESSON_STATUS_LABELS[l.status as LessonStatusValue]} · {formatTime(l.startTime)}–
                  {formatTime(l.endTime)}
                </span>
              </Link>
              <span className="text-muted-foreground shrink-0">
                {formatDateShort(l.startTime)}
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
