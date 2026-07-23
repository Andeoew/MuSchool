'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Plus, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteLesson } from './actions'
import { LessonFormModal, type LessonFormValues } from './lesson-form-modal'
import {
  LESSON_STATUSES,
  LESSON_STATUS_LABELS,
  type LessonStatusValue,
} from '@/lib/validations/lesson'
import { formatTime } from '@/lib/calendar'

export type LessonRow = {
  id: string
  room: string | null
  notes: string | null
  status: LessonStatusValue
  startTime: string
  endTime: string
  durationMinutes: number | null
  student: { id: string; firstName: string; lastName: string }
  teacher: { id: string; firstName: string; lastName: string }
  course: { id: string; name: string; instrument: string; color: string }
  enrollmentId: string
}

export type FilterOption = { id: string; label: string }

const statusBadge: Record<LessonStatusValue, string> = {
  PLANNED: 'bg-blue-500/15 text-blue-600',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600',
  CANCELLED: 'bg-rose-500/15 text-rose-500',
  POSTPONED: 'bg-amber-500/15 text-amber-600',
  NO_SHOW: 'bg-muted text-muted-foreground',
}

function toFormValues(row: LessonRow): LessonFormValues {
  return {
    id: row.id,
    enrollmentId: row.enrollmentId,
    room: row.room,
    startTime: row.startTime,
    endTime: row.endTime,
    notes: row.notes,
    status: row.status,
  }
}

type Props = {
  lessons: LessonRow[]
  teachers: FilterOption[]
  students: FilterOption[]
  courses: FilterOption[]
  instruments: string[]
  filters: {
    search: string
    teacherId: string
    studentId: string
    courseId: string
    instrument: string
    status: string
    dateFrom: string
    dateTo: string
    sort: string
    sortDir: string
  }
}

export function LessonsTable({
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
  const [search, setSearch] = useState(filters.search)
  const [modal, setModal] = useState<
    { mode: 'create' } | { mode: 'edit'; lesson: LessonFormValues } | null
  >(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'ALL') params.delete(key)
      else params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    updateParams({ q: search.trim() })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this lesson? This cannot be undone.')) return
    setOpenMenuId(null)
    startTransition(async () => {
      const result = await deleteLesson(id)
      if (!result.success) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Lessons</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Lesson
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search student, teacher, course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-border bg-muted pl-9 pr-3 text-sm"
          />
        </div>
        <button type="submit" className="h-9 px-4 rounded-xl border border-border text-sm font-medium hover:bg-accent">
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Teacher"
          value={filters.teacherId}
          onChange={(v) => updateParams({ teacherId: v })}
          options={[{ value: '', label: 'All teachers' }, ...teachers.map((t) => ({ value: t.id, label: t.label }))]}
        />
        <FilterSelect
          label="Student"
          value={filters.studentId}
          onChange={(v) => updateParams({ studentId: v })}
          options={[{ value: '', label: 'All students' }, ...students.map((s) => ({ value: s.id, label: s.label }))]}
        />
        <FilterSelect
          label="Course"
          value={filters.courseId}
          onChange={(v) => updateParams({ courseId: v })}
          options={[{ value: '', label: 'All courses' }, ...courses.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <FilterSelect
          label="Instrument"
          value={filters.instrument}
          onChange={(v) => updateParams({ instrument: v })}
          options={[{ value: '', label: 'All instruments' }, ...instruments.map((i) => ({ value: i, label: i }))]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => updateParams({ status: v })}
          options={[
            { value: '', label: 'All statuses' },
            ...LESSON_STATUSES.map((s) => ({ value: s, label: LESSON_STATUS_LABELS[s] })),
          ]}
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value })}
          className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateParams({ dateTo: e.target.value })}
          className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
        />
        <FilterSelect
          label="Sort"
          value={`${filters.sort}:${filters.sortDir}`}
          onChange={(v) => {
            const [sort, sortDir] = v.split(':')
            updateParams({ sort: sort ?? 'date', sortDir: sortDir ?? 'desc' })
          }}
          options={[
            { value: 'date:desc', label: 'Date ↓' },
            { value: 'date:asc', label: 'Date ↑' },
            { value: 'teacher:asc', label: 'Teacher A–Z' },
            { value: 'student:asc', label: 'Student A–Z' },
            { value: 'course:asc', label: 'Course A–Z' },
          ]}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Date', 'Time', 'Student', 'Teacher', 'Course', 'Status', ''].map((h) => (
                  <th
                    key={h || 'a'}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No lessons found. Enroll a student in a course, then schedule a lesson.
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => {
                  const start = new Date(lesson.startTime)
                  const end = new Date(lesson.endTime)
                  return (
                    <tr key={lesson.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3.5 text-[13px] whitespace-nowrap">
                        {start.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatTime(start)}–{formatTime(end)}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-medium">
                        <Link href={`/dashboard/students/${lesson.student.id}`} className="hover:text-gold">
                          {lesson.student.firstName} {lesson.student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[13px]">
                        <Link href={`/dashboard/teachers/${lesson.teacher.id}`} className="hover:text-gold">
                          {lesson.teacher.firstName} {lesson.teacher.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[13px]">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: lesson.course.color }}
                          />
                          <Link href={`/dashboard/courses/${lesson.course.id}`} className="hover:text-gold">
                            {lesson.course.name}
                          </Link>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium',
                            statusBadge[lesson.status],
                          )}
                        >
                          {LESSON_STATUS_LABELS[lesson.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === lesson.id ? null : lesson.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === lesson.id && (
                          <div className="absolute right-4 top-10 z-20 w-40 rounded-xl border border-border bg-card shadow-lg py-1">
                            <Link
                              href={`/dashboard/lessons/${lesson.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-accent"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] hover:bg-accent"
                              onClick={() => {
                                setOpenMenuId(null)
                                setModal({ mode: 'edit', lesson: toFormValues(lesson) })
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-rose-500 hover:bg-rose-500/10"
                              onClick={() => handleDelete(lesson.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <LessonFormModal
          mode={modal.mode}
          lesson={modal.mode === 'edit' ? modal.lesson : undefined}
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      aria-label={label}
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
