'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, UserX, Clock3, XCircle } from 'lucide-react'
import { setLessonStatus } from '../actions'
import type { LessonStatusValue } from '@/lib/validations/lesson'

type Props = {
  lessonId: string
  status: LessonStatusValue
  notes: string | null
  teacherNotes: string | null
}

export function LessonStatusActions({ lessonId, status, notes, teacherNotes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [completeOpen, setCompleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function applyStatus(next: LessonStatusValue) {
    if (next === 'COMPLETED') {
      setCompleteOpen(true)
      return
    }
    if (!confirm(`Mark this lesson as ${next.replace('_', ' ').toLowerCase()}?`)) return
    startTransition(async () => {
      const result = await setLessonStatus(lessonId, next)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleComplete(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await setLessonStatus(lessonId, 'COMPLETED', {
        notes: formData.get('notes'),
        teacherNotes: formData.get('teacherNotes'),
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setCompleteOpen(false)
      router.refresh()
    })
  }

  if (status !== 'PLANNED' && status !== 'POSTPONED') {
    return null
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Lesson completion
        </p>
        <div className="flex flex-wrap gap-2">
          <ActionBtn
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Mark as Completed"
            onClick={() => applyStatus('COMPLETED')}
            disabled={isPending}
            className="text-emerald-600 hover:bg-emerald-500/10"
          />
          <ActionBtn
            icon={<UserX className="w-3.5 h-3.5" />}
            label="Mark as No Show"
            onClick={() => applyStatus('NO_SHOW')}
            disabled={isPending}
            className="text-muted-foreground hover:bg-accent"
          />
          <ActionBtn
            icon={<Clock3 className="w-3.5 h-3.5" />}
            label="Postpone"
            onClick={() => applyStatus('POSTPONED')}
            disabled={isPending}
            className="text-amber-600 hover:bg-amber-500/10"
          />
          <ActionBtn
            icon={<XCircle className="w-3.5 h-3.5" />}
            label="Cancel"
            onClick={() => applyStatus('CANCELLED')}
            disabled={isPending}
            className="text-rose-500 hover:bg-rose-500/10"
          />
        </div>
        {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
      </div>

      {completeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-1">Complete lesson</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add notes before marking this lesson completed. Homework can be attached later.
            </p>
            <form action={handleComplete} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-muted-foreground">Lesson notes</label>
                <textarea
                  name="notes"
                  defaultValue={notes ?? ''}
                  rows={2}
                  className="rounded-xl border border-border bg-muted px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-muted-foreground">Teacher notes</label>
                <textarea
                  name="teacherNotes"
                  defaultValue={teacherNotes ?? ''}
                  rows={3}
                  className="rounded-xl border border-border bg-muted px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="rounded-xl border border-dashed border-border p-3">
                <p className="text-[12px] font-medium text-foreground">Homework</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Placeholder — homework module will attach here.
                </p>
              </div>
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCompleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Mark Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium transition-colors disabled:opacity-50 ${className}`}
    >
      {icon}
      {label}
    </button>
  )
}
