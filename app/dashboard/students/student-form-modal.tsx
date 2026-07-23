'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createStudent, updateStudent } from './actions'
import type { StudentRow } from './students-table'

type Props = {
  mode: 'create' | 'edit'
  student?: StudentRow
  onClose: () => void
  onSuccess: () => void
}

export function StudentFormModal({ mode, student, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      instrument: formData.get('instrument'),
      level: formData.get('level'),
      isActive: formData.get('isActive') === 'on',
    }

    startTransition(async () => {
      const result = mode === 'create' ? await createStudent(payload) : await updateStudent(student!.id, payload)

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
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{mode === 'create' ? 'Add Student' : 'Edit Student'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" name="firstName" defaultValue={student?.firstName} error={fieldErrors.firstName} required />
            <Field label="Last name" name="lastName" defaultValue={student?.lastName} error={fieldErrors.lastName} required />
          </div>
          <Field label="Email" name="email" type="email" defaultValue={student?.email ?? ''} error={fieldErrors.email} />
          <Field label="Phone" name="phone" defaultValue={student?.phone ?? ''} error={fieldErrors.phone} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instrument" name="instrument" defaultValue={student?.instrument ?? ''} error={fieldErrors.instrument} />
            <Field label="Level" name="level" defaultValue={student?.level ?? ''} error={fieldErrors.level} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground mt-1">
            <input type="checkbox" name="isActive" defaultChecked={student ? student.isActive : true} className="rounded border-border" />
            Active
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? 'Saving…' : mode === 'create' ? 'Add Student' : 'Save Changes'}
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
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
      />
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}
