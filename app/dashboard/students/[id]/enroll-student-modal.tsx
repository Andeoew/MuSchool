'use client'

import { useEffect, useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createEnrollment, listEnrollmentFormOptions } from '@/app/dashboard/enrollments/actions'

type Props = {
  studentId: string
  studentName: string
  onClose: () => void
  onSuccess: () => void
}

export function EnrollStudentModal({ studentId, studentName, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [teachers, setTeachers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [courses, setCourses] = useState<
    Array<{ id: string; name: string; instrument: string; defaultDuration: number }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEnrollmentFormOptions()
      .then((opts) => {
        setTeachers(opts.teachers)
        setCourses(opts.courses)
      })
      .catch(() => setError('Could not load form options.'))
      .finally(() => setLoading(false))
  }, [])

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})
    const payload = {
      studentId,
      teacherId: formData.get('teacherId'),
      courseId: formData.get('courseId'),
      startDate: formData.get('startDate'),
      notes: formData.get('notes'),
      status: 'ACTIVE',
    }

    startTransition(async () => {
      const result = await createEnrollment(payload)
      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }
      onSuccess()
    })
  }

  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Enroll Student</h3>
            <p className="text-sm text-muted-foreground">{studentName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <SelectField
            label="Course"
            name="courseId"
            required
            disabled={loading}
            error={fieldErrors.courseId}
            options={courses.map((c) => ({
              value: c.id,
              label: `${c.name} · ${c.instrument}`,
            }))}
          />
          <SelectField
            label="Teacher"
            name="teacherId"
            required
            disabled={loading}
            error={fieldErrors.teacherId}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName}`,
            }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Start date</label>
            <input
              type="date"
              name="startDate"
              required
              defaultValue={todayStr}
              className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
            />
            {fieldErrors.startDate && (
              <p className="text-[11px] text-rose-500">{fieldErrors.startDate[0]}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm resize-none"
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm hover:bg-accent">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || loading}
              className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
  error,
  required,
  disabled,
}: {
  label: string
  name: string
  options: Array<{ value: string; label: string }>
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
        defaultValue=""
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm disabled:opacity-50"
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
