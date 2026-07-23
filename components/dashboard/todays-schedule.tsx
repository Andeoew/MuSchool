import Link from 'next/link'
import { cn } from '@/lib/utils'

const lessons = [
  { time: '09:00', end: '09:50', student: 'Emma Thompson',   teacher: 'Öğr. Clarke',   subject: 'Piyano',  level: 'Seviye 3',     color: 'bg-gold',         status: 'completed' },
  { time: '10:00', end: '10:50', student: 'James Wilson',    teacher: 'Öğr. Rivera',   subject: 'Gitar',   level: 'Başlangıç',    color: 'bg-blue-500',     status: 'completed' },
  { time: '11:30', end: '12:20', student: 'Sofia Martínez',  teacher: 'Öğr. Clarke',   subject: 'Keman',   level: 'İleri',        color: 'bg-emerald-500',  status: 'ongoing'   },
  { time: '13:00', end: '13:50', student: 'Noah Park',       teacher: 'Öğr. Chen',     subject: 'Davul',   level: 'Orta',         color: 'bg-purple-500',   status: 'upcoming'  },
  { time: '14:30', end: '15:20', student: 'Aisha Johnson',   teacher: 'Öğr. Rivera',   subject: 'Vokal',   level: 'Seviye 2',     color: 'bg-rose-500',     status: 'upcoming'  },
  { time: '16:00', end: '16:50', student: 'Luca Bianchi',    teacher: 'Öğr. Clarke',   subject: 'Piyano',  level: 'Seviye 1',     color: 'bg-amber-500',    status: 'upcoming'  },
]

const statusBadge: Record<string, string> = {
  completed: 'bg-muted text-muted-foreground',
  ongoing:   'bg-emerald-500/15 text-emerald-500',
  upcoming:  'bg-muted text-muted-foreground',
}

const statusLabel: Record<string, string> = {
  completed: 'Tamamlandı',
  ongoing:   'Devam ediyor',
  upcoming:  'Yaklaşan',
}

interface TodaysScheduleProps {
  title: string
  subtitle: string
  viewCalendarLabel: string
}

export function TodaysSchedule({ title, subtitle, viewCalendarLabel }: TodaysScheduleProps) {
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

      <div className="flex flex-col divide-y divide-border">
        {lessons.map((lesson) => (
          <div
            key={`${lesson.time}-${lesson.student}`}
            className={cn(
              'flex items-center gap-3 py-3 first:pt-0 last:pb-0',
              lesson.status === 'completed' && 'opacity-55'
            )}
          >
            <div className="w-[68px] shrink-0">
              <p className="text-[11px] font-semibold text-foreground tabular-nums">{lesson.time}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">{lesson.end}</p>
            </div>

            <span className={cn('w-1 h-10 rounded-full shrink-0', lesson.color)} aria-hidden="true" />

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{lesson.student}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {lesson.subject} &middot; {lesson.level} &middot; {lesson.teacher}
              </p>
            </div>

            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', statusBadge[lesson.status])}>
              {statusLabel[lesson.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
