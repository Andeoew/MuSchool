import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getLesson } from '../actions'
import { LessonDetailActions } from './lesson-detail-actions'
import {
  LESSON_STATUS_LABELS,
  LESSON_TYPE_LABELS,
  type LessonStatusValue,
  type LessonTypeValue,
} from '@/lib/validations/lesson'
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

function formatFee(fee: number | null) {
  if (fee == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(fee)
}

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = await getLesson(id)
  if (!lesson) notFound()

  const start = lesson.startTime
  const end = lesson.endTime
  const duration =
    lesson.durationMinutes ??
    Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))

  const status = lesson.status as LessonStatusValue
  const lessonType = lesson.lessonType as LessonTypeValue

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/lessons"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to lessons
          </Link>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {lesson.instrument} lesson
          </h2>
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
            studentId: lesson.studentId,
            teacherId: lesson.teacherId,
            instrument: lesson.instrument,
            level: lesson.level,
            lessonType: lesson.lessonType,
            room: lesson.room,
            lessonFee: lesson.lessonFee,
            startTime: lesson.startTime.toISOString(),
            endTime: lesson.endTime.toISOString(),
            notes: lesson.notes,
            status: lesson.status,
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard
          label="Student"
          value={
            <Link
              href={`/dashboard/students/${lesson.student.id}`}
              className="hover:text-gold transition-colors"
            >
              {lesson.student.firstName} {lesson.student.lastName}
            </Link>
          }
        />
        <InfoCard
          label="Teacher"
          value={
            <Link
              href={`/dashboard/teachers/${lesson.teacher.id}`}
              className="hover:text-gold transition-colors"
            >
              {lesson.teacher.firstName} {lesson.teacher.lastName}
            </Link>
          }
        />
        <InfoCard label="Instrument" value={lesson.instrument} />
        <InfoCard label="Lesson type" value={LESSON_TYPE_LABELS[lessonType]} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Fee" value={formatFee(lesson.lessonFee)} />
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <InfoCard label="Room" value={lesson.room ?? '—'} />
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </p>
          <span
            className={cn(
              'inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium',
              statusBadge[status],
            )}
          >
            {LESSON_STATUS_LABELS[status]}
          </span>
        </div>
        <InfoCard
          label="Created"
          value={lesson.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {lesson.notes?.trim() || 'No notes for this lesson.'}
        </p>
      </div>

      {/* Placeholders for future modules that reference Lesson */}
      <div className="grid sm:grid-cols-3 gap-4">
        <PlaceholderCard
          title="Attendance"
          description="Mark presence, late, or excused for this lesson."
        />
        <PlaceholderCard
          title="Homework"
          description="Assign practice tasks linked to this lesson."
        />
        <PlaceholderCard
          title="Payments"
          description="Track lesson fees and payment status here."
        />
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
      <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mt-3">
        Coming soon
      </p>
    </div>
  )
}
