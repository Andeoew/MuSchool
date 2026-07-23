import { cn } from '@/lib/utils'
import { Cake } from 'lucide-react'

const birthdays = [
  { name: 'Emma Thompson',  instrument: 'Piyano',  date: '18 Tem',  daysLeft: 1,  initials: 'ET', color: 'bg-blue-500/15 text-blue-500'    },
  { name: 'Noah Park',      instrument: 'Davul',   date: '22 Tem',  daysLeft: 5,  initials: 'NP', color: 'bg-purple-500/15 text-purple-500' },
  { name: 'Sofia Martínez', instrument: 'Keman',   date: '25 Tem',  daysLeft: 8,  initials: 'SM', color: 'bg-emerald-500/15 text-emerald-500' },
  { name: 'James Wilson',   instrument: 'Gitar',   date: '29 Tem',  daysLeft: 12, initials: 'JW', color: 'bg-gold-dim text-gold'             },
  { name: 'Aisha Johnson',  instrument: 'Vokal',   date: '3 Ağu',   daysLeft: 17, initials: 'AJ', color: 'bg-rose-500/15 text-rose-500'      },
]

interface UpcomingBirthdaysProps {
  title: string
  emptyLabel: string
}

function daysLeftLabel(n: number) {
  if (n === 0) return 'Bugün!'
  if (n === 1) return 'Yarın'
  return `${n} gün`
}

export function UpcomingBirthdays({ title, emptyLabel }: UpcomingBirthdaysProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Cake className="w-4 h-4 text-gold shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {birthdays.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyLabel}</p>
      ) : (
        <ul role="list" className="flex flex-col divide-y divide-border">
          {birthdays.map((b, i) => (
            <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold shrink-0', b.color)}>
                {b.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.instrument}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-semibold text-foreground">{b.date}</p>
                <p className={cn(
                  'text-[10px] font-medium',
                  b.daysLeft <= 1 ? 'text-gold' : 'text-muted-foreground'
                )}>
                  {daysLeftLabel(b.daysLeft)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
