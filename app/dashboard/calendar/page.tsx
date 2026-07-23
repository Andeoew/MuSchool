'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const lessons = [
  { date: '2026-07-17', time: '09:00', student: 'Emma Thompson', subject: 'Piano', teacher: 'Mr. Clarke', color: 'bg-gold text-background' },
  { date: '2026-07-17', time: '10:00', student: 'James Wilson', subject: 'Guitar', teacher: 'Ms. Rivera', color: 'bg-blue-500 text-white' },
  { date: '2026-07-17', time: '11:30', student: 'Sofia Martínez', subject: 'Violin', teacher: 'Mr. Clarke', color: 'bg-emerald-500 text-white' },
  { date: '2026-07-18', time: '09:00', student: 'Emma Thompson', subject: 'Piano', teacher: 'Mr. Clarke', color: 'bg-gold text-background' },
  { date: '2026-07-18', time: '11:00', student: 'Noah Park', subject: 'Drums', teacher: 'Ms. Chen', color: 'bg-purple-500 text-white' },
  { date: '2026-07-19', time: '10:00', student: 'Sofia Martínez', subject: 'Violin', teacher: 'Mr. Clarke', color: 'bg-emerald-500 text-white' },
  { date: '2026-07-19', time: '14:00', student: 'Aisha Johnson', subject: 'Vocals', teacher: 'Ms. Rivera', color: 'bg-rose-500 text-white' },
  { date: '2026-07-20', time: '09:30', student: 'Luca Bianchi', subject: 'Piano', teacher: 'Mr. Clarke', color: 'bg-gold text-background' },
  { date: '2026-07-21', time: '10:00', student: 'James Wilson', subject: 'Guitar', teacher: 'Ms. Rivera', color: 'bg-blue-500 text-white' },
  { date: '2026-07-22', time: '09:00', student: 'Noah Park', subject: 'Drums', teacher: 'Ms. Chen', color: 'bg-purple-500 text-white' },
  { date: '2026-07-22', time: '13:00', student: 'Isabella Kim', subject: 'Violin', teacher: 'Mr. Clarke', color: 'bg-emerald-500 text-white' },
  { date: '2026-07-24', time: '10:00', student: 'Mia Chen', subject: 'Piano', teacher: 'Mr. Clarke', color: 'bg-gold text-background' },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const today = new Date(2026, 6, 17) // Jul 17 2026
  const [current, setCurrent] = useState({ year: 2026, month: 6 })

  const daysInMonth = getDaysInMonth(current.year, current.month)
  const firstDay = getFirstDayOfMonth(current.year, current.month)

  const prev = () => {
    setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  }
  const next = () => {
    setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })
  }

  const cells = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  const getLessonsForDay = (day: number) => {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return lessons.filter((l) => l.date === dateStr)
  }

  const isToday = (day: number) =>
    day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear()

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all scheduled lessons</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto">
          <CalendarPlus className="w-4 h-4" />
          Schedule Lesson
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={prev}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base font-semibold text-foreground">
            {MONTHS[current.month]} {current.year}
          </h3>
          <button
            onClick={next}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayLessons = day ? getLessonsForDay(day) : []
            return (
              <div
                key={i}
                className={cn(
                  'min-h-[100px] p-2 border-b border-r border-border last:border-r-0 transition-colors',
                  day ? 'hover:bg-accent/30 cursor-pointer' : 'bg-muted/20',
                  (i + 1) % 7 === 0 && 'border-r-0'
                )}
              >
                {day && (
                  <>
                    <span className={cn(
                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1',
                      isToday(day)
                        ? 'bg-gold text-background font-bold'
                        : 'text-foreground'
                    )}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {dayLessons.slice(0, 2).map((lesson, j) => (
                        <div
                          key={j}
                          className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium truncate', lesson.color)}
                        >
                          {lesson.time} {lesson.subject}
                        </div>
                      ))}
                      {dayLessons.length > 2 && (
                        <span className="text-[10px] text-muted-foreground pl-1">+{dayLessons.length - 2} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
