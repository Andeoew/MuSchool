'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParentFormModal } from './parent-form-modal'

export type ParentRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  students: Array<{
    id: string
    firstName: string
    lastName: string
    instrument: string | null
  }>
}

export function ParentsTable({ parents }: { parents: ParentRow[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Veliler</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {parents.length} veli &bull; {parents.reduce((sum, p) => sum + p.students.length, 0)} öğrenci eşleşmesi
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Veli Ekle & Öğrenci Eşle
        </button>
      </div>

      <div className="grid gap-4">
        {parents.map((parent) => (
          <article key={parent.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {parent.firstName} {parent.lastName}
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  {parent.email}
                  {parent.phone ? ` · ${parent.phone}` : ''}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold-dim text-gold border border-gold/30 self-start">
                {parent.students.length} öğrenci
              </span>
            </div>

            {parent.students.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">Henüz eşleşmiş öğrenci yok.</p>
            ) : (
              <ul className="divide-y divide-border">
                {parent.students.map((student) => (
                  <li key={student.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{student.instrument ?? 'Branş belirtilmemiş'}</p>
                    </div>
                    <span
                      className={cn(
                        'text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground'
                      )}
                    >
                      eşleşmiş
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {parents.length === 0 && (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Henüz veli eklenmemiş. Yeni veli ekleyip öğrencilerle eşleştirin.
        </div>
      )}

      {modalOpen && (
        <ParentFormModal
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
