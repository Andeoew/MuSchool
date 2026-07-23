'use client'

import { useEffect, useMemo, useRef, useState, useTransition, type PointerEvent } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addDays,
  addMonths,
  CALENDAR_HOURS,
  formatDayLabel,
  formatMonthLabel,
  formatTime,
  formatWeekLabel,
  getMonthGrid,
  HOUR_HEIGHT,
  parseDateKey,
  startOfWeek,
  toDateKey,
  withAlpha,
  type CalendarView,
} from '@/lib/calendar'
import { updateLessonTime } from '@/app/dashboard/lessons/actions'
import { LessonFormModal, type LessonFormValues } from '@/app/dashboard/lessons/lesson-form-modal'
import { LESSON_STATUSES, LESSON_STATUS_LABELS } from '@/lib/validations/lesson'

export type CalendarLesson = {
  id: string
  enrollmentId: string
  room: string | null
  notes: string | null
  status: string
  startTime: string
  endTime: string
  student: { id: string; firstName: string; lastName: string }
  teacher: { id: string; firstName: string; lastName: string }
  course: { id: string; name: string; instrument: string; color: string; defaultDuration: number }
}

type FilterOption = { id: string; label: string; instrument?: string }

type Props = {
  view: CalendarView
  dateKey: string
  lessons: CalendarLesson[]
  teachers: FilterOption[]
  students: FilterOption[]
  courses: FilterOption[]
  instruments: string[]
  filters: {
    teacherId: string
    studentId: string
    courseId: string
    instrument: string
    status: string
    q: string
  }
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toFormValues(lesson: CalendarLesson): LessonFormValues {
  return {
    id: lesson.id,
    enrollmentId: lesson.enrollmentId,
    room: lesson.room,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    notes: lesson.notes,
    status: lesson.status,
  }
}

function slotDateTime(day: Date, hour: number, minute = 0): string {
  const d = new Date(day)
  d.setHours(hour, minute, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CalendarShell({
  view,
  dateKey,
  lessons,
  teachers,
  students,
  courses,
  instruments,
  filters,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.q)
  const [modal, setModal] = useState<
    | { mode: 'create'; defaultStart?: string; defaultEnd?: string }
    | { mode: 'edit'; lesson: LessonFormValues }
    | null
  >(null)
  const [localLessons, setLocalLessons] = useState(lessons)

  useEffect(() => {
    setLocalLessons(lessons)
  }, [lessons])

  const focus = useMemo(() => {
    const [y, m, d] = dateKey.split('-').map(Number)
    return new Date(y!, m! - 1, d!)
  }, [dateKey])

  function pushParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (!v) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function navigate(delta: number) {
    let next: Date
    if (view === 'month') next = addMonths(focus, delta)
    else if (view === 'day') next = addDays(focus, delta)
    else next = addDays(focus, delta * 7)
    pushParams({ date: toDateKey(next) })
  }

  function goToday() {
    pushParams({ date: toDateKey(new Date()) })
  }

  function persistTime(id: string, start: Date, end: Date) {
    setLocalLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, startTime: start.toISOString(), endTime: end.toISOString() }
          : l,
      ),
    )
    startTransition(async () => {
      const result = await updateLessonTime(id, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      })
      if (!result.success) {
        alert(result.error)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  const title =
    view === 'month'
      ? formatMonthLabel(focus)
      : view === 'day'
        ? formatDayLabel(focus)
        : formatWeekLabel(startOfWeek(focus))

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Lesson schedule</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          Schedule Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') pushParams({ q: search.trim() })
            }}
            className="h-9 w-44 rounded-xl border border-border bg-muted pl-9 pr-3 text-sm"
          />
        </div>
        <Select
          value={filters.teacherId}
          onChange={(v) => pushParams({ teacherId: v })}
          options={[{ value: '', label: 'All teachers' }, ...teachers.map((t) => ({ value: t.id, label: t.label }))]}
        />
        <Select
          value={filters.studentId}
          onChange={(v) => pushParams({ studentId: v })}
          options={[{ value: '', label: 'All students' }, ...students.map((s) => ({ value: s.id, label: s.label }))]}
        />
        <Select
          value={filters.courseId}
          onChange={(v) => pushParams({ courseId: v })}
          options={[{ value: '', label: 'All courses' }, ...courses.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <Select
          value={filters.instrument}
          onChange={(v) => pushParams({ instrument: v })}
          options={[{ value: '', label: 'All instruments' }, ...instruments.map((i) => ({ value: i, label: i }))]}
        />
        <Select
          value={filters.status}
          onChange={(v) => pushParams({ status: v })}
          options={[
            { value: '', label: 'All statuses' },
            ...LESSON_STATUSES.map((s) => ({ value: s, label: LESSON_STATUS_LABELS[s] })),
          ]}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-accent"
            >
              Today
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>

          <div className="flex items-center gap-1 rounded-xl border border-border p-0.5">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => pushParams({ view: v })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  view === v ? 'bg-gold-dim text-gold' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' ? (
          <MonthView
            focus={focus}
            lessons={localLessons}
            onDayClick={(d) => pushParams({ view: 'day', date: toDateKey(d) })}
            onLessonClick={(l) => setModal({ mode: 'edit', lesson: toFormValues(l) })}
            onEmptyDay={(d) =>
              setModal({
                mode: 'create',
                defaultStart: slotDateTime(d, 10),
                defaultEnd: slotDateTime(d, 11),
              })
            }
          />
        ) : view === 'day' ? (
          <TimeGrid
            days={[focus]}
            lessons={localLessons}
            onSlotClick={(day, hour) =>
              setModal({
                mode: 'create',
                defaultStart: slotDateTime(day, hour),
                defaultEnd: slotDateTime(day, hour + 1),
              })
            }
            onLessonClick={(l) => setModal({ mode: 'edit', lesson: toFormValues(l) })}
            onMoveOrResize={persistTime}
          />
        ) : (
          <TimeGrid
            days={Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focus), i))}
            lessons={localLessons}
            showDayHeaders
            onSlotClick={(day, hour) =>
              setModal({
                mode: 'create',
                defaultStart: slotDateTime(day, hour),
                defaultEnd: slotDateTime(day, hour + 1),
              })
            }
            onLessonClick={(l) => setModal({ mode: 'edit', lesson: toFormValues(l) })}
            onMoveOrResize={persistTime}
          />
        )}

        {localLessons.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground border-t border-border">
            No lessons in this range. Click a slot or Schedule Lesson to add one.
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

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
    >
      {options.map((o) => (
        <option key={o.value || o.label} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function TimeGrid({
  days,
  lessons,
  showDayHeaders,
  onSlotClick,
  onLessonClick,
  onMoveOrResize,
}: {
  days: Date[]
  lessons: CalendarLesson[]
  showDayHeaders?: boolean
  onSlotClick: (day: Date, hour: number) => void
  onLessonClick: (lesson: CalendarLesson) => void
  onMoveOrResize: (id: string, start: Date, end: Date) => void
}) {
  const todayKey = toDateKey(new Date())
  const colCount = days.length

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

  return (
    <div className="overflow-x-auto">
      <div className={cn(colCount > 1 ? 'min-w-[900px]' : 'min-w-[480px]')}>
        {showDayHeaders && (
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: `56px repeat(${colCount}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-border" />
            {days.map((day) => {
              const key = toDateKey(day)
              const isToday = key === todayKey
              return (
                <div
                  key={key}
                  className={cn(
                    'py-3 text-center border-r border-border last:border-r-0',
                    isToday && 'bg-gold-dim/40',
                  )}
                >
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {DAY_LABELS[days.indexOf(day)]}
                  </p>
                  <p className={cn('text-sm font-semibold mt-0.5', isToday ? 'text-gold' : 'text-foreground')}>
                    {day.getDate()}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div
          className="grid"
          style={{ gridTemplateColumns: `56px repeat(${colCount}, minmax(0, 1fr))` }}
        >
          <div className="border-r border-border">
            {CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-border px-1.5 pt-1 text-[10px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
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
                  isToday && 'bg-gold-dim/20',
                )}
              >
                {CALENDAR_HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => onSlotClick(day, hour)}
                    className="w-full border-b border-border hover:bg-accent/40 transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                    aria-label={`Schedule at ${hour}:00`}
                  />
                ))}

                <div className="absolute inset-0 pointer-events-none p-0.5">
                  {dayLessons.map((lesson) => (
                    <DraggableLesson
                      key={lesson.id}
                      lesson={lesson}
                      day={day}
                      onClick={() => onLessonClick(lesson)}
                      onMoveOrResize={onMoveOrResize}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DraggableLesson({
  lesson,
  day,
  onClick,
  onMoveOrResize,
}: {
  lesson: CalendarLesson
  day: Date
  onClick: () => void
  onMoveOrResize: (id: string, start: Date, end: Date) => void
}) {
  const start = new Date(lesson.startTime)
  const end = new Date(lesson.endTime)
  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const top = Math.max(0, (startHour - CALENDAR_HOURS[0]!) * HOUR_HEIGHT)
  const height = Math.max(28, (endHour - startHour) * HOUR_HEIGHT)
  const color = lesson.course.color

  const dragRef = useRef<{
    mode: 'move' | 'resize'
    startY: number
    origStart: number
    origEnd: number
    duration: number
  } | null>(null)

  function onPointerDown(e: PointerEvent, mode: 'move' | 'resize') {
    e.stopPropagation()
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    dragRef.current = {
      mode,
      startY: e.clientY,
      origStart: start.getTime(),
      origEnd: end.getTime(),
      duration: end.getTime() - start.getTime(),
    }
  }

  function onPointerMove(e: PointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const deltaMinutes = Math.round(((e.clientY - drag.startY) / HOUR_HEIGHT) * 60 / 15) * 15
    if (drag.mode === 'move') {
      const newStart = new Date(drag.origStart + deltaMinutes * 60000)
      const newEnd = new Date(newStart.getTime() + drag.duration)
      // Snap within same day visually via CSS would need state — persist on up
      ;(e.currentTarget as HTMLElement).dataset.previewStart = String(newStart.getTime())
      ;(e.currentTarget as HTMLElement).dataset.previewEnd = String(newEnd.getTime())
    } else {
      const newEnd = new Date(Math.max(drag.origStart + 15 * 60000, drag.origEnd + deltaMinutes * 60000))
      ;(e.currentTarget as HTMLElement).dataset.previewEnd = String(newEnd.getTime())
    }
  }

  function onPointerUp(e: PointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const deltaMinutes = Math.round(((e.clientY - drag.startY) / HOUR_HEIGHT) * 60 / 15) * 15
    dragRef.current = null
    if (deltaMinutes === 0) {
      onClick()
      return
    }
    if (drag.mode === 'move') {
      const newStart = new Date(drag.origStart + deltaMinutes * 60000)
      // Keep on same calendar day as the column
      newStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
      const newEnd = new Date(newStart.getTime() + drag.duration)
      onMoveOrResize(lesson.id, newStart, newEnd)
    } else {
      const newEnd = new Date(Math.max(drag.origStart + 15 * 60000, drag.origEnd + deltaMinutes * 60000))
      onMoveOrResize(lesson.id, start, newEnd)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(e) => onPointerDown(e, 'move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      style={{
        top,
        height,
        backgroundColor: withAlpha(color, 0.18),
        borderColor: withAlpha(color, 0.45),
        color,
      }}
      className="absolute left-0.5 right-0.5 pointer-events-auto rounded-lg border px-1.5 py-1 text-left overflow-hidden cursor-grab active:cursor-grabbing shadow-sm select-none"
    >
      <p className="text-[10px] font-semibold truncate">
        {formatTime(start)}–{formatTime(end)}
      </p>
      <p className="text-[11px] font-medium truncate text-foreground">
        {lesson.student.firstName} {lesson.student.lastName}
      </p>
      <p className="text-[10px] opacity-80 truncate text-foreground">
        {lesson.teacher.firstName} {lesson.teacher.lastName}
      </p>
      <p className="text-[10px] opacity-80 truncate text-foreground">
        {lesson.course.name} · {lesson.status}
      </p>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
        onPointerDown={(e) => onPointerDown(e, 'resize')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}

function MonthView({
  focus,
  lessons,
  onDayClick,
  onLessonClick,
  onEmptyDay,
}: {
  focus: Date
  lessons: CalendarLesson[]
  onDayClick: (d: Date) => void
  onLessonClick: (l: CalendarLesson) => void
  onEmptyDay: (d: Date) => void
}) {
  const weeks = getMonthGrid(focus)
  const todayKey = toDateKey(new Date())
  const month = focus.getMonth()

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarLesson[]>()
    for (const l of lessons) {
      const key = toDateKey(new Date(l.startTime))
      const list = map.get(key) ?? []
      list.push(l)
      map.set(key, list)
    }
    return map
  }, [lessons])

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {weeks.flat().map((day) => {
          const key = toDateKey(day)
          const dayLessons = byDay.get(key) ?? []
          const inMonth = day.getMonth() === month
          return (
            <div
              key={key}
              className={cn(
                'min-h-[96px] bg-card p-1.5 flex flex-col gap-0.5',
                !inMonth && 'opacity-40',
                key === todayKey && 'ring-1 ring-inset ring-gold/50',
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick(day)}
                className={cn(
                  'self-start text-[12px] font-semibold w-6 h-6 rounded-full',
                  key === todayKey ? 'bg-gold text-background' : 'text-foreground hover:bg-accent',
                )}
              >
                {day.getDate()}
              </button>
              <div className="flex flex-col gap-0.5 flex-1">
                {dayLessons.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onLessonClick(l)}
                    className="text-left text-[10px] px-1 py-0.5 rounded truncate text-foreground"
                    style={{ backgroundColor: withAlpha(l.course.color, 0.2) }}
                  >
                    {formatTime(new Date(l.startTime))} {l.student.firstName}
                  </button>
                ))}
                {dayLessons.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayLessons.length - 3} more
                  </span>
                )}
                {dayLessons.length === 0 && inMonth && (
                  <button
                    type="button"
                    onClick={() => onEmptyDay(day)}
                    className="flex-1 min-h-[24px] rounded hover:bg-accent/50"
                    aria-label="Add lesson"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
