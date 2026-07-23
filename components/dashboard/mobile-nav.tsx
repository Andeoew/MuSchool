'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X, Music2,
  LayoutDashboard, Users, GraduationCap, UsersRound, CalendarDays,
  BookOpenCheck, ClipboardList, FileText, CreditCard, BarChart3,
  Megaphone, Bell, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/use-locale'
import { UserSection } from '@/components/dashboard/user-section'

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'students', href: '/dashboard/students', icon: Users },
  { key: 'teachers', href: '/dashboard/teachers', icon: GraduationCap },
  { key: 'parents', href: '/dashboard/parents', icon: UsersRound },
  { key: 'calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { key: 'lessons', href: '/dashboard/lessons', icon: BookOpenCheck },
  { key: 'attendance', href: '/dashboard/attendance', icon: ClipboardList },
  { key: 'homework', href: '/dashboard/homework', icon: FileText },
  { key: 'payments', href: '/dashboard/payments', icon: CreditCard },
  { key: 'reports', href: '/dashboard/reports', icon: BarChart3 },
  { key: 'announcements', href: '/dashboard/announcements', icon: Megaphone },
  { key: 'notifications', href: '/dashboard/notifications', icon: Bell },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
] as const

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigasyon menüsü"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-sidebar border-r border-border',
          'transition-transform duration-300 ease-in-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold shadow-gold">
              <Music2 className="w-4 h-4 text-background" strokeWidth={2.2} />
            </span>
            <span className="font-bold text-[14px] tracking-tight text-foreground">
              Mu<span className="text-gold">School</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">
          {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
            const isActive = key === 'dashboard' ? pathname === href : pathname.startsWith(href)
            const label = t.nav[key as keyof typeof t.nav] as string
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gold-dim text-gold'
                    : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon
                  className={cn('w-4 h-4 shrink-0', isActive ? 'text-gold' : 'text-sidebar-foreground/40')}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <UserSection onSignOut={onClose} />
        </div>
      </div>
    </>
  )
}
