/**
 * Calendar date helpers. Views (week/month/day) all query Lessons by range —
 * never by a separate Calendar entity.
 */

export type CalendarView = 'week' | 'month' | 'day'

/** Monday 00:00:00.000 local of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return end
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const startFmt = weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endFmt = weekEnd.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startFmt} – ${endFmt}`
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Hour slots for the week grid (08:00–21:00). */
export const CALENDAR_HOURS = Array.from({ length: 14 }, (_, i) => i + 8)

export function lessonColorClass(lessonType: string | null | undefined): string {
  switch (lessonType) {
    case 'Group':
      return 'bg-blue-500/15 text-blue-600 border-blue-500/25'
    case 'Trial':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25'
    case 'Makeup':
      return 'bg-purple-500/15 text-purple-600 border-purple-500/25'
    case 'Individual':
    default:
      return 'bg-gold-dim text-gold border-gold/30'
  }
}
