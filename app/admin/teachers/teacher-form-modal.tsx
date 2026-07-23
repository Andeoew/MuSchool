'use client'

import { useState, useTransition } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'
import { createTeacher } from '@/actions/teacher'

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export function TeacherFormModal({ onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      instrument: formData.get('instrument'),
      tempPassword: formData.get('tempPassword'),
    }

    startTransition(async () => {
      const result = await createTeacher(payload)

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
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Yeni Eğitmen Ekle</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad" name="firstName" error={fieldErrors.firstName} required />
            <Field label="Soyad" name="lastName" error={fieldErrors.lastName} required />
          </div>
          <Field label="E-posta" name="email" type="email" error={fieldErrors.email} required />
          <Field label="Telefon" name="phone" error={fieldErrors.phone} />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Branş</label>
            <select
              name="instrument"
              required
              className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
            >
              <option value="">Branş seçin</option>
              {INSTRUMENT_OPTIONS.map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </select>
            {fieldErrors.instrument && <p className="text-[11px] text-rose-500">{fieldErrors.instrument[0]}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-muted-foreground">Geçici Parola</label>
            <div className="relative">
              <input
                name="tempPassword"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="En az 8 karakter"
                className="h-9 w-full rounded-xl border border-border bg-muted px-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.tempPassword && <p className="text-[11px] text-rose-500">{fieldErrors.tempPassword[0]}</p>}
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? 'Kaydediliyor…' : 'Eğitmeni Ekle'}
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
  error,
  required,
}: {
  label: string
  name: string
  type?: string
  error?: string[]
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-9 rounded-xl border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all"
      />
      {error && <p className="text-[11px] text-rose-500">{error[0]}</p>}
    </div>
  )
}
