import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/calendar'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'

export type ScheduleLessonItem = {
  id: string
  instrument: string
  status: string
  startTime: string
  endTime: string
  studentName: string
  teacherName: string
  level?: string | null
}

const statusTone: Record<string, string> = {
  PLANNED: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'completed',
  POSTPONED: 'upcoming',
  NO_SHOW: 'completed',
}

const statusBadge: Record<string, string> = {
  completed: 'bg-muted text-muted-foreground',
  ongoing: 'bg-emerald-500/15 text-emerald-500',
  upcoming: 'bg-muted text-muted-foreground',
}

const colors = ['bg-gold', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500']

interface TodaysScheduleProps {
  title: string
  subtitle: string
  viewCalendarLabel: string
  lessons: ScheduleLessonItem[]
}

export function TodaysSchedule({ title, subtitle, viewCalendarLabel, lessons }: TodaysScheduleProps) {
  const now = Date.now()

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <Link
          href="/dashboard/calendar"
          className="text-xs text-gold hover:underline underline-offset-4 transition-colors shrink-0"
        >
          {viewCalendarLabel}
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No lessons scheduled for today.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {lessons.map((lesson, i) => {
            const start = new Date(lesson.startTime)
            const end = new Date(lesson.endTime)
            const tone =
              lesson.status === 'COMPLETED'
                ? 'completed'
                : start.getTime() <= now && end.getTime() >= now
                  ? 'ongoing'
                  : statusTone[lesson.status] ?? 'upcoming'

            return (
              <Link
                key={lesson.id}
                href={`/dashboard/lessons/${lesson.id}`}
                className={cn(
                  'flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity',
                  tone === 'completed' && 'opacity-55',
                )}
              >
                <div className="w-[68px] shrink-0">
                  <p className="text-[11px] font-semibold text-foreground tabular-nums">
                    {formatTime(start)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{formatTime(end)}</p>
                </div>

                <span
                  className={cn('w-1 h-10 rounded-full shrink-0', colors[i % colors.length])}
                  aria-hidden="true"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{lesson.studentName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {lesson.instrument}
                    {lesson.level ? ` · ${lesson.level}` : ''} · {lesson.teacherName}
                  </p>
                </div>

                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0',
                    statusBadge[tone],
                  )}
                >
                  {tone === 'ongoing'
                    ? 'In progress'
                    : LESSON_STATUS_LABELS[lesson.status as LessonStatusValue] ?? lesson.status}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
