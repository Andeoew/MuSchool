'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Sun, Moon, Search, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/use-locale'

interface TopNavProps {
  onMobileMenuToggle: () => void
}

const notifications = [
  { id: 1, textTr: 'Emma Thompson dersini kaçırdı', textEn: 'Emma Thompson missed her lesson', time: '5dk önce', timeEn: '5m ago', dot: 'bg-destructive' },
  { id: 2, textTr: 'Wilson ailesinden ödeme alındı', textEn: 'New payment received from Wilson family', time: '22dk önce', timeEn: '22m ago', dot: 'bg-gold' },
  { id: 3, textTr: "James Liu ödevini teslim etti", textEn: 'Homework submitted by James Liu', time: '1sa önce', timeEn: '1h ago', dot: 'bg-foreground' },
  { id: 4, textTr: "Öğretmen Ayşe 20 Tem için izin planladı", textEn: 'Teacher Ayşe scheduled leave on Jul 20', time: '3sa önce', timeEn: '3h ago', dot: 'bg-muted-foreground' },
]

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { t, locale, toggle } = useLocale()

  useEffect(() => { setMounted(true) }, [])

  // Derive page title from nav translations
  const segmentMap: Record<string, keyof typeof t.nav> = {
    '/dashboard/students': 'students',
    '/dashboard/teachers': 'teachers',
    '/dashboard/parents': 'parents',
    '/dashboard/calendar': 'calendar',
    '/dashboard/lessons': 'lessons',
    '/dashboard/attendance': 'attendance',
    '/dashboard/homework': 'homework',
    '/dashboard/payments': 'payments',
    '/dashboard/reports': 'reports',
    '/dashboard/announcements': 'announcements',
    '/dashboard/notifications': 'notifications',
    '/dashboard/settings': 'settings',
  }

  const pageTitle = segmentMap[pathname]
    ? (t.nav[segmentMap[pathname]] as string)
    : t.nav.dashboard

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center gap-4 px-4 sticky top-0 z-30 shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuToggle}
        aria-label="Menüyü aç"
        className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-foreground tracking-tight">{pageTitle}</h1>

      {/* Search */}
      <div className="hidden sm:flex flex-1 max-w-xs ml-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder={t.topnav.search}
            className="w-full h-8 rounded-lg border border-border bg-muted pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Language toggle */}
        <button
          onClick={toggle}
          aria-label={t.topnav.toggleLanguage}
          className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors tracking-widest"
        >
          {locale === 'tr' ? 'EN' : 'TR'}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={t.topnav.toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
          ) : (
            <span className="w-4 h-4 block" aria-hidden="true" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={t.topnav.notifications}
            aria-expanded={notifOpen}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" aria-hidden="true" />
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="text-[13px] font-semibold text-foreground">{t.topnav.notifications}</p>
                  <span className="text-[10px] font-medium text-gold bg-gold-dim px-2 py-0.5 rounded-full">
                    {notifications.length} {t.topnav.newBadge}
                  </span>
                </div>
                <ul role="list">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border last:border-0"
                    >
                      <span className={cn('mt-1.5 w-2 h-2 rounded-full shrink-0', n.dot)} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground leading-snug">
                          {locale === 'tr' ? n.textTr : n.textEn}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {locale === 'tr' ? n.time : n.timeEn}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-gold hover:underline underline-offset-4 transition-colors">
                    {t.topnav.markAllRead}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div
          aria-label="Kullanıcı profili"
          className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-background text-[10px] font-bold ml-1 cursor-pointer select-none"
        >
          SA
        </div>
      </div>
    </header>
  )
}
