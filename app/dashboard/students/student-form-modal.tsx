'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { createStudent, updateStudent } from './actions'
import { calculateAge, isMinor } from '@/lib/age'
import { PARENT_RELATIONSHIPS } from '@/lib/validations/student'
import type { StudentRow } from './students-table'
import { cn } from '@/lib/utils'
import { CredentialsDialog, type IssuedCredential } from '@/components/credentials-dialog'

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
  const [credentials, setCredentials] = useState<IssuedCredential[] | null>(null)

  const [birthDate, setBirthDate] = useState('')
  const [showParentOptional, setShowParentOptional] = useState(false)
  const [parentOpen, setParentOpen] = useState(true)

  const age = useMemo(() => {
    if (!birthDate) return null
    const date = new Date(birthDate)
    if (Number.isNaN(date.getTime())) return null
    return calculateAge(date)
  }, [birthDate])

  const under18 = useMemo(() => {
    if (!birthDate) return false
    const date = new Date(birthDate)
    if (Number.isNaN(date.getTime())) return false
    return isMinor(date)
  }, [birthDate])

  const showParentSection = mode === 'create' && (under18 || showParentOptional)

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    const payload: Record<string, unknown> = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      birthDate: formData.get('birthDate') || undefined,
      instrument: formData.get('instrument'),
      level: formData.get('level'),
      isActive: formData.get('isActive') === 'on',
      createLoginAccount: formData.get('createStudentLogin') === 'on',
    }

    if (showParentSection) {
      const parentFirstName = String(formData.get('parentFirstName') ?? '').trim()
      const parentLastName = String(formData.get('parentLastName') ?? '').trim()
      const parentEmail = String(formData.get('parentEmail') ?? '').trim()
      const parentRelationship = String(formData.get('parentRelationship') ?? '').trim()

      if (under18 || (parentFirstName && parentLastName && parentEmail && parentRelationship)) {
        payload.parent = {
          firstName: parentFirstName,
          lastName: parentLastName,
          email: parentEmail,
          phone: formData.get('parentPhone'),
          relationship: parentRelationship,
          createLoginAccount: formData.get('createLoginAccount') === 'on',
        }
      }
    }

    startTransition(async () => {
      const result =
        mode === 'create' ? await createStudent(payload) : await updateStudent(student!.id, payload)

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }

      if (mode === 'create' && result.data?.credentials?.length) {
        setCredentials(result.data.credentials)
        return
      }

      onSuccess()
    })
  }

  if (credentials) {
    return (
      <CredentialsDialog
        title="Login account created"
        credentials={credentials}
        onDone={onSuccess}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {mode === 'create' ? 'Add Student' : 'Edit Student'}
          </h3>
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
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-muted-foreground">Birth date</label>
              <input
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value)
                  if (!e.target.value) setShowParentOptional(false)
                }}
                className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
              />
              {age !== null && (
                <p className="text-[11px] text-muted-foreground">Age: {age}</p>
              )}
              {fieldErrors.birthDate && <p className="text-[11px] text-rose-500">{fieldErrors.birthDate[0]}</p>}
              {fieldErrors.parent && <p className="text-[11px] text-rose-500">{fieldErrors.parent[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instrument" name="instrument" defaultValue={student?.instrument ?? ''} error={fieldErrors.instrument} />
              <Field label="Level" name="level" defaultValue={student?.level ?? ''} error={fieldErrors.level} />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground mt-1">
              <input type="checkbox" name="isActive" defaultChecked={student ? student.isActive : true} className="rounded border-border" />
              Active
            </label>
            {mode === 'create' && (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="createStudentLogin" className="rounded border-border" />
                Create login account for this student (requires email)
              </label>
            )}

            {mode === 'create' && birthDate && !under18 && !showParentOptional && (
              <button
                type="button"
                onClick={() => {
                  setShowParentOptional(true)
                  setParentOpen(true)
                }}
                className="mt-1 text-sm font-medium text-gold hover:underline underline-offset-4 self-start"
              >
                Add Parent (Optional)
              </button>
            )}

            {showParentSection && (
              <div className="mt-2 rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setParentOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 text-sm font-medium text-foreground"
                >
                  <span>Parent Information{under18 ? ' (required)' : ''}</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', parentOpen && 'rotate-180')} />
                </button>
                {parentOpen && (
                  <div className="flex flex-col gap-3 p-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First name" name="parentFirstName" error={fieldErrors['parent.firstName']} required={under18} />
                      <Field label="Last name" name="parentLastName" error={fieldErrors['parent.lastName']} required={under18} />
                    </div>
                    <Field label="Phone" name="parentPhone" error={fieldErrors['parent.phone']} />
                    <Field label="Email" name="parentEmail" type="email" error={fieldErrors['parent.email']} required={under18} />
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-medium text-muted-foreground">Relationship</label>
                      <select
                        name="parentRelationship"
                        required={under18}
                        defaultValue=""
                        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
                      >
                        <option value="" disabled>
                          Select…
                        </option>
                        {PARENT_RELATIONSHIPS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {fieldErrors['parent.relationship'] && (
                        <p className="text-[11px] text-rose-500">{fieldErrors['parent.relationship'][0]}</p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        name="createLoginAccount"
                        defaultChecked
                        className="rounded border-border"
                      />
                      Create login account for this parent
                    </label>
                  </div>
                )}
              </div>
            )}

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
