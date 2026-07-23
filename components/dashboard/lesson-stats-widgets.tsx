import Link from 'next/link'
import { CheckCircle2, XCircle, CalendarDays, History } from 'lucide-react'
import { formatTime } from '@/lib/calendar'
import { LESSON_STATUS_LABELS, type LessonStatusValue } from '@/lib/validations/lesson'

export type RecentLessonItem = {
  id: string
  instrument: string
  courseName?: string
  status: string
  startTime: string
  studentName: string
  teacherName: string
}

type Props = {
  completedToday: number
  cancelledToday: number
  recentLessons: RecentLessonItem[]
}

export function LessonStatsWidgets({ completedToday, cancelledToday, recentLessons }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatTile
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          label="Completed today"
          value={String(completedToday)}
          href="/dashboard/lessons?status=COMPLETED"
        />
        <StatTile
          icon={<XCircle className="w-4 h-4 text-rose-500" />}
          label="Cancelled today"
          value={String(cancelledToday)}
          href="/dashboard/lessons?status=CANCELLED"
        />
        <StatTile
          icon={<CalendarDays className="w-4 h-4 text-gold" />}
          label="View all lessons"
          value="→"
          href="/dashboard/lessons"
        />
        <StatTile
          icon={<History className="w-4 h-4 text-blue-500" />}
          label="Calendar"
          value="→"
          href="/dashboard/calendar"
        />
      </div>

      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Lessons</h3>
          <Link
            href="/dashboard/lessons"
            className="text-xs text-gold hover:underline underline-offset-4 transition-colors"
          >
            View all
          </Link>
        </div>
        {recentLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No past lessons yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentLessons.map((l) => {
              const start = new Date(l.startTime)
              return (
                <li key={l.id}>
                  <Link
                    href={`/dashboard/lessons/${l.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-90"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">{l.studentName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {l.courseName ?? l.instrument} · {l.teacherName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-muted-foreground">
                        {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                        {formatTime(start)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {LESSON_STATUS_LABELS[l.status as LessonStatusValue] ?? l.status}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-4 hover:bg-accent/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </Link>
  )
}
