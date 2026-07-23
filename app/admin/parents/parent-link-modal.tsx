'use client'

import { useEffect, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { linkParentToStudents } from '@/actions/parent'
import { listStudentsForParentForm } from '@/actions/teacher'
import { PARENT_RELATIONSHIPS } from '@/lib/validations/student'
import type { ParentRow } from './parents-table'

type StudentOption = {
  id: string
  firstName: string
  lastName: string
  instrument: string | null
}

type Props = {
  parent: ParentRow
  onClose: () => void
  onSuccess: () => void
}

export function ParentLinkModal({ parent, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const linkedIds = new Set(parent.students.map((s) => s.id))

  useEffect(() => {
    listStudentsForParentForm()
      .then((rows) => setStudents(rows.filter((s) => !linkedIds.has(s.id))))
      .catch(() => setError('Öğrenci listesi yüklenemedi.'))
      .finally(() => setLoadingStudents(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent.id])

  function toggleStudent(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await linkParentToStudents({
        parentId: parent.id,
        studentIds: selectedIds,
        relationship: formData.get('relationship') || undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      onSuccess()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            Link students to {parent.firstName} {parent.lastName}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Relationship</label>
            <select
              name="relationship"
              defaultValue=""
              className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
            >
              <option value="">Optional…</option>
              {PARENT_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-muted-foreground">Students</label>
            {loadingStudents ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No additional students available to link.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="rounded border-border"
                    />
                    <span className="flex-1 text-sm text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{student.instrument ?? '—'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || selectedIds.length === 0}
              className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? 'Linking…' : 'Link Students'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
