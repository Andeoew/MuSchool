'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteCourse } from './actions'
import { CourseFormModal, type CourseFormValues } from './course-form-modal'

export type CourseRow = CourseFormValues & {
  teacherCount: number
  studentCount: number
}

function formatFee(fee: number | null) {
  if (fee == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(fee)
}

export function CoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modal, setModal] = useState<
    { mode: 'create' } | { mode: 'edit'; course: CourseFormValues } | null
  >(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(q) || c.instrument.toLowerCase().includes(q)
    const matchesFilter =
      filter === 'all' || (filter === 'active' ? c.isActive : !c.isActive)
    return matchesSearch && matchesFilter
  })

  function handleDelete(id: string) {
    if (!confirm('Delete this course? This cannot be undone.')) return
    setOpenMenuId(null)
    startTransition(async () => {
      const result = await deleteCourse(id)
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
          <h2 className="text-xl font-bold text-foreground tracking-tight">Courses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {courses.length} course{courses.length === 1 ? '' : 's'} ·{' '}
            {courses.filter((c) => c.isActive).length} active
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-border bg-muted pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-gold-dim text-gold'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Course Name', 'Teachers', 'Students', 'Duration', 'Default Fee', 'Status', ''].map(
                  (h) => (
                    <th
                      key={h || 'a'}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: course.color }}
                        />
                        <div>
                          <Link
                            href={`/dashboard/courses/${course.id}`}
                            className="text-[13px] font-medium text-foreground hover:text-gold"
                          >
                            {course.name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground">{course.instrument}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-foreground">{course.teacherCount}</td>
                    <td className="px-4 py-3.5 text-[13px] text-foreground">{course.studentCount}</td>
                    <td className="px-4 py-3.5 text-[13px] text-muted-foreground">
                      {course.defaultDuration} min
                    </td>
                    <td className="px-4 py-3.5 text-[13px] tabular-nums">
                      {formatFee(course.defaultLessonFee)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium',
                          course.isActive
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === course.id && (
                        <div className="absolute right-4 top-10 z-20 w-40 rounded-xl border border-border bg-card shadow-lg py-1">
                          <Link
                            href={`/dashboard/courses/${course.id}`}
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
                              setModal({ mode: 'edit', course })
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <CourseFormModal
          mode={modal.mode}
          course={modal.mode === 'edit' ? modal.course : undefined}
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
