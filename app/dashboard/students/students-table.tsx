'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteStudent } from './actions'
import { StudentFormModal } from './student-form-modal'

export type StudentRow = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  instrument: string | null
  level: string | null
  teacher: string | null
  isActive: boolean
  joined: string
}

const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-gold', 'bg-cyan-500']

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export function StudentsTable({ students }: { students: StudentRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalState, setModalState] = useState<{ mode: 'create' } | { mode: 'edit'; student: StudentRow } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    const matchesSearch =
      name.includes(q) ||
      (s.instrument ?? '').toLowerCase().includes(q) ||
      (s.teacher ?? '').toLowerCase().includes(q)
    const matchesFilter = filter === 'all' || (filter === 'active') === s.isActive
    return matchesSearch && matchesFilter
  })

  function handleDelete(id: string) {
    if (!confirm('Delete this student? This cannot be undone.')) return
    setOpenMenuId(null)
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteStudent(id)
      setDeletingId(null)
      if (!result.success) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Students</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {students.length} enrolled &bull; {students.filter((s) => s.isActive).length} active
          </p>
        </div>
        <button
          onClick={() => setModalState({ mode: 'create' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search students, subjects, teachers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-border bg-muted pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-gold-dim text-gold border border-gold/30'
                  : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Student', 'Subject', 'Level', 'Teacher', 'Joined', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student, i) => (
                <tr
                  key={student.id}
                  className={cn(
                    'hover:bg-accent/50 transition-colors group',
                    deletingId === student.id && 'opacity-50 pointer-events-none'
                  )}
                >
                  <td className="px-5 py-3.5">
                    <a href={`/dashboard/students/${student.id}`} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0',
                          avatarColors[i % avatarColors.length]
                        )}
                      >
                        {initials(student.firstName, student.lastName)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-[13px] group-hover:underline">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{student.email ?? '—'}</p>
                      </div>
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-foreground">{student.instrument ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{student.level ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{student.teacher ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">{student.joined}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                        student.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', student.isActive ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                      {student.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === student.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-5 top-10 z-20 w-36 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                          <button
                            onClick={() => {
                              setModalState({ mode: 'edit', student })
                              setOpenMenuId(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-accent transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            {students.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6">
                <p className="text-sm font-medium text-foreground">No students yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add your first student to start managing enrollments, lessons, and attendance.
                </p>
                <button
                  onClick={() => setModalState({ mode: 'create' })}
                  className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No students match your search.</p>
            )}
          </div>
        )}
      </div>

      {modalState && (
        <StudentFormModal
          mode={modalState.mode}
          student={modalState.mode === 'edit' ? modalState.student : undefined}
          onClose={() => setModalState(null)}
          onSuccess={() => {
            setModalState(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
