import { cn } from '@/lib/utils'
import { UserPlus, CreditCard, ClipboardCheck, BookOpen, AlertCircle, MessageSquare } from 'lucide-react'

const activities = [
  {
    icon: UserPlus,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
    text: 'Yeni öğrenci kaydı: Zeynep Arslan',
    time: '5 dk önce',
  },
  {
    icon: CreditCard,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    text: 'Ödeme alındı: Kaya ailesi — ₺1.200',
    time: '23 dk önce',
  },
  {
    icon: ClipboardCheck,
    iconBg: 'bg-gold-dim',
    iconColor: 'text-gold',
    text: 'Devam güncellendi: Salı 10:00 dersi',
    time: '1 sa önce',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-500',
    text: 'Ödev teslim edildi: James Liu — Piyano Çalışması',
    time: '2 sa önce',
  },
  {
    icon: AlertCircle,
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-500',
    text: 'Ders iptal edildi: Aisha Johnson — Cum 16:00',
    time: '3 sa önce',
  },
  {
    icon: MessageSquare,
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    text: 'Veliye mesaj gönderildi: Wilson ailesi',
    time: '4 sa önce',
  },
]

interface RecentActivityProps {
  title: string
}

export function RecentActivity({ title }: RecentActivityProps) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      <ul role="list" className="flex flex-col">
        {activities.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
            <div className={cn('flex items-center justify-center w-8 h-8 rounded-xl shrink-0 mt-0.5', item.iconBg)}>
              <item.icon className={cn('w-3.5 h-3.5', item.iconColor)} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-foreground leading-snug">{item.text}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
