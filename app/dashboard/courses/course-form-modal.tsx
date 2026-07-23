'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createCourse, updateCourse } from './actions'
import { COURSE_COLORS } from '@/lib/validations/course'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'

export type CourseFormValues = {
  id: string
  name: string
  instrument: string
  defaultDuration: number
  defaultLessonFee: number | null
  description: string | null
  color: string
  isActive: boolean
}

type Props = {
  mode: 'create' | 'edit'
  course?: CourseFormValues
  onClose: () => void
  onSuccess: () => void
}

export function CourseFormModal({ mode, course, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [color, setColor] = useState(course?.color ?? COURSE_COLORS[0])

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})
    const payload = {
      name: formData.get('name'),
      instrument: formData.get('instrument'),
      defaultDuration: formData.get('defaultDuration'),
      defaultLessonFee: formData.get('defaultLessonFee'),
      description: formData.get('description'),
      color,
      isActive: formData.get('isActive') === 'on',
    }

    startTransition(async () => {
      const result =
        mode === 'create' ? await createCourse(payload) : await updateCourse(course!.id, payload)
      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
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
            {mode === 'create' ? 'New Course' : 'Edit Course'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <Field label="Course name" name="name" required defaultValue={course?.name} error={fieldErrors.name} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-muted-foreground">Instrument</label>
              <select
                name="instrument"
                required
                defaultValue={course?.instrument ?? ''}
                className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
              >
                <option value="" disabled>
                  Select…
                </option>
                {INSTRUMENT_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {fieldErrors.instrument && (
                <p className="text-[11px] text-rose-500">{fieldErrors.instrument[0]}</p>
              )}
            </div>
            <Field
              label="Default duration (min)"
              name="defaultDuration"
              type="number"
              required
              defaultValue={String(course?.defaultDuration ?? 50)}
              error={fieldErrors.defaultDuration}
            />
          </div>
          <Field
            label="Default lesson fee"
            name="defaultLessonFee"
            type="number"
            defaultValue={course?.defaultLessonFee != null ? String(course.defaultLessonFee) : ''}
            error={fieldErrors.defaultLessonFee}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {COURSE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'var(--foreground)' : 'transparent',
                    transform: color === c ? 'scale(1.1)' : undefined,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Description</label>
            <textarea
              name="description"
              defaultValue={course?.description ?? ''}
              rows={3}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm resize-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={course?.isActive ?? true}
              className="rounded border-border"
            />
            Active
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : mode === 'create' ? 'Create Course' : 'Save Changes'}
            </button>
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
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? '1' : undefined}
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm"
      />
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}
