import { Users, GraduationCap, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Data is typed here — replace with real DB queries via services/ once connected
const stats = [
  {
    labelKey: 'totalStudents',
    value: '248',
    change: '+12',
    positive: true,
    icon: Users,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-500',
  },
  {
    labelKey: 'activeTeachers',
    value: '18',
    change: '+2',
    positive: true,
    icon: GraduationCap,
    iconBg: 'bg-gold-dim',
    iconColor: 'text-gold',
  },
  {
    labelKey: 'monthlyRevenue',
    value: '₺47.850',
    change: '+8.4%',
    positive: true,
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-500',
  },
  {
    labelKey: 'attendanceRate',
    value: '%94.2',
    change: '-1.3%',
    positive: false,
    icon: CheckSquare,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconColor: 'text-rose-500',
  },
] as const

// Labels are passed in from the parent so this component stays a pure Server Component
interface StatCardsProps {
  labels: {
    totalStudents: string
    activeTeachers: string
    monthlyRevenue: string
    attendanceRate: string
    fromLastMonth: string
  }
}

export function StatCards({ labels }: StatCardsProps) {
  const labelMap: Record<string, string> = {
    totalStudents: labels.totalStudents,
    activeTeachers: labels.activeTeachers,
    monthlyRevenue: labels.monthlyRevenue,
    attendanceRate: labels.attendanceRate,
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(({ labelKey, value, change, positive, icon: Icon, iconBg, iconColor }) => (
        <div
          key={labelKey}
          className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-snug">
              {labelMap[labelKey]}
            </p>
            <div className={cn('flex items-center justify-center w-9 h-9 rounded-xl shrink-0', iconBg)}>
              <Icon className={cn('w-4 h-4', iconColor)} strokeWidth={1.8} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {positive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500 shrink-0" aria-hidden="true" />
              )}
              <span className={cn('text-xs font-medium', positive ? 'text-emerald-500' : 'text-rose-500')}>
                {change}
              </span>
              <span className="text-xs text-muted-foreground">{labels.fromLastMonth}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
