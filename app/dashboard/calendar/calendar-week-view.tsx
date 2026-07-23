'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addDays,
  CALENDAR_HOURS,
  formatTime,
  formatWeekLabel,
  lessonColorClass,
  startOfWeek,
  toDateKey,
} from '@/lib/calendar'
import { LessonFormModal, type LessonFormValues } from './lesson-form-modal'

export type CalendarLesson = {
  id: string
  subject: string
  level: string | null
  lessonType: string | null
  room: string | null
  startTime: string // ISO
  endTime: string
  status: string
  student: { id: string; firstName: string; lastName: string; instrument: string | null }
  teacher: { id: string; firstName: string; lastName: string }
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Props = {
  /** ISO week-start (Monday) date key YYYY-MM-DD */
  weekStartKey: string
  lessons: CalendarLesson[]
}

function toFormValues(lesson: CalendarLesson): LessonFormValues {
  return {
    id: lesson.id,
    studentId: lesson.student.id,
    teacherId: lesson.teacher.id,
    subject: lesson.subject,
    level: lesson.level,
    lessonType: lesson.lessonType,
    room: lesson.room,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    notes: null,
    status: lesson.status,
  }
}

function slotDateTime(day: Date, hour: number): string {
  const d = new Date(day)
  d.setHours(hour, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00`
}

export function CalendarWeekView({ weekStartKey, lessons }: Props) {
  const router = useRouter()
  const weekStart = useMemo(() => {
    const [y, m, d] = weekStartKey.split('-').map(Number)
    return startOfWeek(new Date(y!, m! - 1, d!))
  }, [weekStartKey])

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const [modal, setModal] = useState<
    | { mode: 'create'; defaultStart?: string; defaultEnd?: string }
    | { mode: 'edit'; lesson: LessonFormValues }
    | null
  >(null)

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, CalendarLesson[]>()
    for (const day of days) map.set(toDateKey(day), [])
    for (const lesson of lessons) {
      const key = toDateKey(new Date(lesson.startTime))
      const list = map.get(key)
      if (list) list.push(lesson)
    }
    return map
  }, [days, lessons])

  function goWeek(offset: number) {
    const next = addDays(weekStart, offset * 7)
    router.push(`/dashboard/calendar?week=${toDateKey(next)}`)
  }

  function goToday() {
    router.push(`/dashboard/calendar?week=${toDateKey(startOfWeek(new Date()))}`)
  }

  const todayKey = toDateKey(new Date())

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly lesson schedule</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          Schedule Lesson
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goWeek(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => goWeek(1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Today
            </button>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">{formatWeekLabel(weekStart)}</h3>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
            Week view
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day headers */}
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border">
              <div className="border-r border-border" />
              {days.map((day) => {
                const key = toDateKey(day)
                const isToday = key === todayKey
                return (
                  <div
                    key={key}
                    className={cn(
                      'py-3 text-center border-r border-border last:border-r-0',
                      isToday && 'bg-gold-dim/40'
                    )}
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {DAY_LABELS[days.indexOf(day)]}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-semibold mt-0.5',
                        isToday ? 'text-gold' : 'text-foreground'
                      )}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Time grid + lesson cards stacked per day column */}
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
              {/* Hours gutter */}
              <div className="border-r border-border">
                {CALENDAR_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-border px-1.5 pt-1 text-[10px] text-muted-foreground"
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const key = toDateKey(day)
                const dayLessons = lessonsByDay.get(key) ?? []
                const isToday = key === todayKey

                return (
                  <div
                    key={key}
                    className={cn(
                      'relative border-r border-border last:border-r-0',
                      isToday && 'bg-gold-dim/20'
                    )}
                  >
                    {CALENDAR_HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() =>
                          setModal({
                            mode: 'create',
                            defaultStart: slotDateTime(day, hour),
                            defaultEnd: slotDateTime(day, hour + 1),
                          })
                        }
                        className="h-16 w-full border-b border-border hover:bg-accent/40 transition-colors"
                        aria-label={`Schedule at ${hour}:00`}
                      />
                    ))}

                    {/* Absolute lesson cards positioned by start time */}
                    <div className="absolute inset-0 pointer-events-none p-0.5">
                      {dayLessons.map((lesson) => {
                        const start = new Date(lesson.startTime)
                        const end = new Date(lesson.endTime)
                        const startHour = start.getHours() + start.getMinutes() / 60
                        const endHour = end.getHours() + end.getMinutes() / 60
                        const top = Math.max(0, (startHour - CALENDAR_HOURS[0]!) * 64)
                        const height = Math.max(28, (endHour - startHour) * 64)

                        const instrument = lesson.student.instrument ?? lesson.subject

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModal({ mode: 'edit', lesson: toFormValues(lesson) })
                            }}
                            style={{ top, height }}
                            className={cn(
                              'absolute left-0.5 right-0.5 pointer-events-auto rounded-lg border px-1.5 py-1 text-left overflow-hidden',
                              'hover:brightness-95 transition-all shadow-sm',
                              lessonColorClass(lesson.lessonType)
                            )}
                          >
                            <p className="text-[10px] font-semibold truncate">
                              {formatTime(start)}–{formatTime(end)}
                            </p>
                            <p className="text-[11px] font-medium truncate">
                              {lesson.student.firstName} {lesson.student.lastName}
                            </p>
                            <p className="text-[10px] opacity-80 truncate">
                              {lesson.teacher.firstName} {lesson.teacher.lastName}
                            </p>
                            <p className="text-[10px] opacity-80 truncate">
                              {instrument}
                              {lesson.lessonType ? ` · ${lesson.lessonType}` : ''}
                              {lesson.room ? ` · ${lesson.room}` : ''}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {lessons.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground border-t border-border">
            No lessons scheduled this week. Click a time slot or Schedule Lesson to add one.
          </div>
        )}
      </div>

      {modal && (
        <LessonFormModal
          mode={modal.mode}
          lesson={modal.mode === 'edit' ? modal.lesson : undefined}
          defaultStart={modal.mode === 'create' ? modal.defaultStart : undefined}
          defaultEnd={modal.mode === 'create' ? modal.defaultEnd : undefined}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
