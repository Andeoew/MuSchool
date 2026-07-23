import Link from 'next/link'
import { cn } from '@/lib/utils'

const upcoming = [
  { student: 'Mia Johnson',   subject: 'Keman',  time: '09:00', date: 'Yar.',        teacher: 'Öğr. Clarke',  color: 'bg-emerald-500' },
  { student: 'Carlos Ruiz',   subject: 'Gitar',  time: '10:30', date: 'Yar.',        teacher: 'Öğr. Rivera',  color: 'bg-blue-500'    },
  { student: 'Yuki Tanaka',   subject: 'Piyano', time: '13:00', date: 'Yar.',        teacher: 'Öğr. Chen',    color: 'bg-gold'        },
  { student: 'Amara Diallo',  subject: 'Davul',  time: '15:00', date: 'Cum.',        teacher: 'Öğr. Clarke',  color: 'bg-purple-500'  },
  { student: 'Felix Wagner',  subject: 'Vokal',  time: '11:00', date: 'Cmt.',        teacher: 'Öğr. Rivera',  color: 'bg-rose-500'    },
]

interface UpcomingLessonsProps {
  title: string
  viewAllLabel: string
}

export function UpcomingLessons({ title, viewAllLabel }: UpcomingLessonsProps) {
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

      <ul role="list" className="flex flex-col divide-y divide-border">
        {upcoming.map((item, i) => (
          <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', item.color)} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{item.student}</p>
              <p className="text-[11px] text-muted-foreground truncate">{item.subject} &middot; {item.teacher}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-semibold text-foreground tabular-nums">{item.time}</p>
              <p className="text-[10px] text-muted-foreground">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
