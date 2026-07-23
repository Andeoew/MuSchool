import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getLesson } from '../actions'
import { LessonDetailActions } from './lesson-detail-actions'
import { LessonStatusActions } from './lesson-status-actions'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'
import { formatTime } from '@/lib/calendar'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const statusBadge: Record<LessonStatusValue, string> = {
  PLANNED: 'bg-blue-500/15 text-blue-600',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600',
  CANCELLED: 'bg-rose-500/15 text-rose-500',
  POSTPONED: 'bg-amber-500/15 text-amber-600',
  NO_SHOW: 'bg-muted text-muted-foreground',
}

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = await getLesson(id)
  if (!lesson) notFound()

  const { enrollment } = lesson
  const start = lesson.startTime
  const end = lesson.endTime
  const duration =
    lesson.durationMinutes ??
    Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
  const status = lesson.status as LessonStatusValue

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/lessons"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to lessons
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: enrollment.course.color }}
            />
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {enrollment.course.name}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {start.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            · {formatTime(start)}–{formatTime(end)}
          </p>
        </div>
        <LessonDetailActions
          lesson={{
            id: lesson.id,
            enrollmentId: lesson.enrollmentId,
            room: lesson.room,
            startTime: lesson.startTime.toISOString(),
            endTime: lesson.endTime.toISOString(),
            notes: lesson.notes,
            status: lesson.status,
          }}
        />
      </div>

      <LessonStatusActions
        lessonId={lesson.id}
        status={status}
        notes={lesson.notes}
        teacherNotes={lesson.teacherNotes}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard
          label="Student"
          value={
            <Link href={`/dashboard/students/${enrollment.student.id}`} className="hover:text-gold">
              {enrollment.student.firstName} {enrollment.student.lastName}
            </Link>
          }
        />
        <InfoCard
          label="Teacher"
          value={
            <Link href={`/dashboard/teachers/${enrollment.teacher.id}`} className="hover:text-gold">
              {enrollment.teacher.firstName} {enrollment.teacher.lastName}
            </Link>
          }
        />
        <InfoCard
          label="Course"
          value={
            <Link href={`/dashboard/courses/${enrollment.course.id}`} className="hover:text-gold">
              {enrollment.course.name}
            </Link>
          }
        />
        <InfoCard label="Instrument" value={enrollment.course.instrument} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard
          label="Date"
          value={start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        />
        <InfoCard label="Time" value={`${formatTime(start)}–${formatTime(end)}`} />
        <InfoCard label="Duration" value={`${duration} min`} />
        <InfoCard label="Room" value={lesson.room ?? '—'} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</p>
        <span
          className={cn(
            'inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium',
            statusBadge[status],
          )}
        >
          {LESSON_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Lesson notes</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {lesson.notes?.trim() || 'No lesson notes.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Teacher notes</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {lesson.teacherNotes?.trim() || 'No teacher notes yet.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <PlaceholderCard title="Attendance" description="Mark presence for this lesson." />
        <PlaceholderCard title="Homework" description="Assign practice linked to this lesson." />
        <PlaceholderCard title="Payments" description="Track fees for this lesson." />
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm font-semibold text-foreground mt-1">{value}</div>
    </div>
  )
}

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-[12px] text-muted-foreground mt-1.5">{description}</p>
      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mt-3">
        Coming soon
      </p>
    </div>
  )
}
