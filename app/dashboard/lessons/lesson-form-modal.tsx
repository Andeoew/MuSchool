'use client'

import { useEffect, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import {
  createLesson,
  updateLesson,
  deleteLesson,
  listLessonFormOptions,
} from '@/app/dashboard/lessons/actions'
import { LESSON_STATUSES, LESSON_STATUS_LABELS } from '@/lib/validations/lesson'

export type LessonFormValues = {
  id: string
  enrollmentId: string
  room: string | null
  startTime: string
  endTime: string
  notes: string | null
  status: string
}

type EnrollmentOption = {
  id: string
  student: { firstName: string; lastName: string }
  teacher: { firstName: string; lastName: string }
  course: { name: string; instrument: string; defaultDuration: number }
}

type Props = {
  mode: 'create' | 'edit'
  lesson?: LessonFormValues
  defaultStart?: string
  defaultEnd?: string
  onClose: () => void
  onSuccess: () => void
}

function toLocalInputValue(isoOrLocal: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoOrLocal) && !isoOrLocal.endsWith('Z')) {
    return isoOrLocal.slice(0, 16)
  }
  const d = new Date(isoOrLocal)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function splitDateTime(isoOrLocal: string): { date: string; time: string } {
  const local = toLocalInputValue(isoOrLocal)
  if (!local.includes('T')) return { date: '', time: '' }
  const [date, time] = local.split('T')
  return { date: date ?? '', time: time ?? '' }
}

function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return ''
  return `${date}T${time}`
}

export function LessonFormModal({ mode, lesson, defaultStart, defaultEnd, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(lesson?.enrollmentId ?? '')

  const startParts = splitDateTime(lesson?.startTime ?? defaultStart ?? '')
  const endParts = splitDateTime(lesson?.endTime ?? defaultEnd ?? '')

  useEffect(() => {
    listLessonFormOptions()
      .then(({ enrollments: e }) => setEnrollments(e))
      .catch(() => setError('Could not load enrollments.'))
      .finally(() => setLoadingOptions(false))
  }, [])

  const selected = enrollments.find((e) => e.id === selectedEnrollmentId)

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})
    const date = String(formData.get('lessonDate') ?? '')
    const startOnly = String(formData.get('startTimeOnly') ?? '')
    const endOnly = String(formData.get('endTimeOnly') ?? '')

    const payload = {
      enrollmentId: formData.get('enrollmentId'),
      room: formData.get('room'),
      startTime: combineDateAndTime(date, startOnly),
      endTime: combineDateAndTime(date, endOnly),
      notes: formData.get('notes'),
      status: formData.get('status') || 'PLANNED',
    }

    startTransition(async () => {
      const result =
        mode === 'create' ? await createLesson(payload) : await updateLesson(lesson!.id, payload)
      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }
      onSuccess()
    })
  }

  function handleDelete() {
    if (!lesson || !confirm('Delete this lesson? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteLesson(lesson.id)
      if (!result.success) {
        setError(result.error)
        return
      }
      onSuccess()
    })
  }

  function onEnrollmentChange(id: string) {
    setSelectedEnrollmentId(id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {mode === 'create' ? 'Schedule Lesson' : 'Edit Lesson'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Enrollment</label>
            <select
              name="enrollmentId"
              required
              disabled={loadingOptions}
              value={selectedEnrollmentId}
              onChange={(e) => onEnrollmentChange(e.target.value)}
              className="h-9 rounded-xl border border-border bg-muted px-3 text-sm disabled:opacity-50"
            >
              <option value="" disabled>
                Select enrollment…
              </option>
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.student.firstName} {e.student.lastName} · {e.course.name} ·{' '}
                  {e.teacher.firstName} {e.teacher.lastName}
                </option>
              ))}
            </select>
            {fieldErrors.enrollmentId && (
              <p className="text-[11px] text-rose-500">{fieldErrors.enrollmentId[0]}</p>
            )}
            {selected && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selected.course.instrument} · default {selected.course.defaultDuration} min
              </p>
            )}
          </div>

          <Field
            label="Date"
            name="lessonDate"
            type="date"
            required
            defaultValue={startParts.date}
            error={fieldErrors.startTime}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start time"
              name="startTimeOnly"
              type="time"
              required
              defaultValue={startParts.time}
              error={fieldErrors.startTime}
            />
            <Field
              label="End time"
              name="endTimeOnly"
              type="time"
              required
              defaultValue={
                endParts.time ||
                (selected && startParts.time
                  ? addMinutesToTime(startParts.time, selected.course.defaultDuration)
                  : startParts.time)
              }
              error={fieldErrors.endTime}
            />
          </div>
          <Field label="Room" name="room" defaultValue={lesson?.room ?? ''} error={fieldErrors.room} />
          {mode === 'edit' && (
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-muted-foreground">Status</label>
              <select
                name="status"
                defaultValue={lesson?.status ?? 'PLANNED'}
                className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
              >
                {LESSON_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LESSON_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Notes</label>
            <textarea
              name="notes"
              defaultValue={lesson?.notes ?? ''}
              rows={2}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm resize-none"
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-between gap-2 mt-3">
            {mode === 'edit' ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 disabled:opacity-50"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || loadingOptions}
                className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold disabled:opacity-50"
              >
                {isPending ? 'Saving…' : mode === 'create' ? 'Schedule' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  if (h == null || m == null) return time
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  error,
  required,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  error?: string[]
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
      />
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}
