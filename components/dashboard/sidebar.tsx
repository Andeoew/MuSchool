'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Music2,
  LayoutDashboard,
  Users,
  GraduationCap,
  UsersRound,
  CalendarDays,
  BookOpenCheck,
  ClipboardList,
  FileText,
  CreditCard,
  BarChart3,
  Megaphone,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/use-locale'

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

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-border bg-sidebar transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[228px]'
      )}
      aria-label={t.nav.dashboard}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-border shrink-0 overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold shadow-gold shrink-0">
            <Music2 className="w-4 h-4 text-background" strokeWidth={2.2} />
          </span>
          {!collapsed && (
            <span className="font-bold text-[14px] tracking-tight text-foreground whitespace-nowrap">
              Mu<span className="text-gold">School</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto overflow-x-hidden"
        aria-label="Ana navigasyon"
      >
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = key === 'dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          const label = t.nav[key as keyof typeof t.nav] as string

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group select-none',
                isActive
                  ? 'bg-gold-dim text-gold'
                  : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon
                className={cn(
                  'shrink-0 transition-colors',
                  collapsed ? 'w-[18px] h-[18px]' : 'w-[15px] h-[15px]',
                  isActive
                    ? 'text-gold'
                    : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/80'
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {!collapsed && (
                <span className="truncate flex-1">{label}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-border shrink-0 flex flex-col gap-0.5">
        {/* User */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-background text-[10px] font-bold shrink-0">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground truncate">Sarah Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">sarah@muschool.app</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <Link
          href="/login"
          title={collapsed ? t.auth.signOut : undefined}
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-[15px] h-[15px] shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>{t.auth.signOut}</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? t.nav.expand : t.nav.collapse}
          className={cn(
            'flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-[15px] h-[15px] shrink-0" strokeWidth={1.8} />
          ) : (
            <>
              <ChevronLeft className="w-[15px] h-[15px] shrink-0" strokeWidth={1.8} />
              <span>{t.nav.collapse}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
