'use client'

import { useEffect, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import {
  createLesson,
  updateLesson,
  deleteLesson,
  listLessonFormOptions,
} from '@/app/dashboard/lessons/actions'
import { LESSON_TYPES } from '@/lib/validations/lesson'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'

export type LessonFormValues = {
  id: string
  studentId: string
  teacherId: string
  subject: string
  level: string | null
  lessonType: string | null
  room: string | null
  startTime: string // datetime-local value
  endTime: string
  notes: string | null
  status: string
}

type Option = { id: string; firstName: string; lastName: string; instrument?: string | null; instruments?: string[] }

type Props = {
  mode: 'create' | 'edit'
  lesson?: LessonFormValues
  /** Prefill when scheduling from a calendar slot */
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

export function LessonFormModal({ mode, lesson, defaultStart, defaultEnd, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [students, setStudents] = useState<Option[]>([])
  const [teachers, setTeachers] = useState<Option[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    listLessonFormOptions()
      .then(({ students: s, teachers: t }) => {
        setStudents(s)
        setTeachers(t)
      })
      .catch(() => setError('Could not load students/teachers.'))
      .finally(() => setLoadingOptions(false))
  }, [])

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    const payload = {
      studentId: formData.get('studentId'),
      teacherId: formData.get('teacherId'),
      subject: formData.get('subject'),
      level: formData.get('level'),
      lessonType: formData.get('lessonType'),
      room: formData.get('room'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      notes: formData.get('notes'),
      status: formData.get('status') || 'SCHEDULED',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {mode === 'create' ? 'Schedule Lesson' : 'Edit Lesson'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <SelectField
            label="Student"
            name="studentId"
            required
            disabled={loadingOptions}
            defaultValue={lesson?.studentId}
            error={fieldErrors.studentId}
            options={students.map((s) => ({
              value: s.id,
              label: `${s.firstName} ${s.lastName}${s.instrument ? ` · ${s.instrument}` : ''}`,
            }))}
          />
          <SelectField
            label="Teacher"
            name="teacherId"
            required
            disabled={loadingOptions}
            defaultValue={lesson?.teacherId}
            error={fieldErrors.teacherId}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName}`,
            }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Instrument"
              name="subject"
              required
              defaultValue={lesson?.subject}
              error={fieldErrors.subject}
              options={INSTRUMENT_OPTIONS.map((i) => ({ value: i, label: i }))}
            />
            <SelectField
              label="Lesson type"
              name="lessonType"
              defaultValue={lesson?.lessonType ?? 'Individual'}
              error={fieldErrors.lessonType}
              options={LESSON_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              name="startTime"
              type="datetime-local"
              required
              defaultValue={
                lesson?.startTime
                  ? toLocalInputValue(lesson.startTime)
                  : defaultStart
                    ? toLocalInputValue(defaultStart)
                    : ''
              }
              error={fieldErrors.startTime}
            />
            <Field
              label="End"
              name="endTime"
              type="datetime-local"
              required
              defaultValue={
                lesson?.endTime
                  ? toLocalInputValue(lesson.endTime)
                  : defaultEnd
                    ? toLocalInputValue(defaultEnd)
                    : ''
              }
              error={fieldErrors.endTime}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room" name="room" defaultValue={lesson?.room ?? ''} error={fieldErrors.room} />
            <Field label="Level" name="level" defaultValue={lesson?.level ?? ''} error={fieldErrors.level} />
          </div>
          {mode === 'edit' && (
            <SelectField
              label="Status"
              name="status"
              defaultValue={lesson?.status ?? 'SCHEDULED'}
              error={fieldErrors.status}
              options={[
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'ONGOING', label: 'Ongoing' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Notes</label>
            <textarea
              name="notes"
              defaultValue={lesson?.notes ?? ''}
              rows={2}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all resize-none"
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-between gap-2 mt-3">
            {mode === 'edit' ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || loadingOptions}
                className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all disabled:opacity-50"
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
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
      />
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
  required,
  disabled,
}: {
  label: string
  name: string
  options: Array<{ value: string; label: string }>
  defaultValue?: string
  error?: string[]
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <select
        name={name}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue ?? ''}
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all disabled:opacity-50"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}
