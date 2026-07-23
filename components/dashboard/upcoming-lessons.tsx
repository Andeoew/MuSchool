import Link from 'next/link'

export type UpcomingLessonItem = {
  id: string
  instrument: string
  courseName: string
  courseColor: string
  /** Preformatted on the server */
  timeLabel: string
  dateLabel: string
  studentName: string
  teacherName: string
}

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
          {lessons.map((item) => (
            <li key={item.id}>
              <Link
                href={`/dashboard/lessons/${item.id}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.courseColor }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{item.studentName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.courseName} &middot; {item.teacherName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-semibold text-foreground tabular-nums">
                    {item.timeLabel}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.dateLabel}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
