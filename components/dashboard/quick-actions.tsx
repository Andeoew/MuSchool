import Link from 'next/link'
import { UserPlus, BookOpenCheck, GraduationCap, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const actions = [
  { icon: UserPlus,       labelKey: 'addStudent',    href: '/dashboard/students',  colorClass: 'bg-blue-500/15 text-blue-500'         },
  { icon: BookOpenCheck,  labelKey: 'addLesson',     href: '/dashboard/lessons',   colorClass: 'bg-gold-dim text-gold'                 },
  { icon: GraduationCap,  labelKey: 'addTeacher',    href: '/dashboard/teachers',  colorClass: 'bg-purple-500/15 text-purple-500'      },
  { icon: CreditCard,     labelKey: 'recordPayment', href: '/dashboard/payments',  colorClass: 'bg-emerald-500/15 text-emerald-500'    },
] as const

interface QuickActionsProps {
  title: string
  labels: Record<'addStudent' | 'addLesson' | 'addTeacher' | 'recordPayment', string>
}

export function QuickActions({ title, labels }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ icon: Icon, labelKey, href, colorClass }) => (
          <Link
            key={labelKey}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border',
              'hover:bg-accent hover:border-gold/30 transition-all duration-150 group'
            )}
          >
            <div className={cn('flex items-center justify-center w-9 h-9 rounded-xl transition-transform group-hover:scale-105', colorClass)}>
              <Icon className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <span className="text-[12px] font-medium text-foreground/80 text-center leading-tight">
              {labels[labelKey]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
