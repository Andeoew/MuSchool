import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/calendar'

export type UpcomingLessonItem = {
  id: string
  instrument: string
  startTime: string
  studentName: string
  teacherName: string
}

const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-gold', 'bg-purple-500', 'bg-rose-500']

interface UpcomingLessonsProps {
  title: string
  viewAllLabel: string
  lessons: UpcomingLessonItem[]
}

export function UpcomingLessons({ title, viewAllLabel, lessons }: UpcomingLessonsProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Link
          href="/dashboard/lessons"
          className="text-xs text-gold hover:underline underline-offset-4 transition-colors shrink-0"
        >
          {viewAllLabel}
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No upcoming lessons this week.</p>
      ) : (
        <ul role="list" className="flex flex-col divide-y divide-border">
          {lessons.map((item, i) => {
            const start = new Date(item.startTime)
            return (
              <li key={item.id}>
                <Link
                  href={`/dashboard/lessons/${item.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity"
                >
                  <span
                    className={cn('w-2.5 h-2.5 rounded-full shrink-0', colors[i % colors.length])}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{item.studentName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.instrument} &middot; {item.teacherName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold text-foreground tabular-nums">
                      {formatTime(start)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
