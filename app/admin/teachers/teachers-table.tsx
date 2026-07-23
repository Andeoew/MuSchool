'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INSTRUMENT_OPTIONS } from '@/lib/auth-utils'
import { createTeacher } from '@/actions/teacher'
import { TeacherFormModal } from './teacher-form-modal'

export type TeacherRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  instruments: string[]
  isActive: boolean
  hiredAt: string
}

export function TeachersTable({ teachers }: { teachers: TeacherRow[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Eğitmenler</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {teachers.length} eğitmen &bull; {teachers.filter((t) => t.isActive).length} aktif
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Eğitmen Ekle
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Eğitmen', 'E-posta', 'Telefon', 'Branş', 'İşe Başlama', 'Durum'].map((h) => (
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
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground text-[13px]">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{teacher.email}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{teacher.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-foreground">
                    {teacher.instruments.join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground whitespace-nowrap">
                    {teacher.hiredAt}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                        teacher.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          teacher.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                        )}
                      />
                      {teacher.isActive ? 'aktif' : 'pasif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {teachers.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Henüz eğitmen eklenmemiş. İlk eğitmeni ekleyerek başlayın.
          </div>
        )}
      </div>

      {modalOpen && (
        <TeacherFormModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
