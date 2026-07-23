'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, KeyRound, Pencil, Trash2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteParent, resetParentPassword } from '@/actions/parent'
import { ParentFormModal } from './parent-form-modal'
import { ParentEditModal } from './parent-edit-modal'
import { ParentLinkModal } from './parent-link-modal'
import { CredentialsDialog, type IssuedCredential } from '@/components/credentials-dialog'

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
  const [, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ParentRow | null>(null)
  const [linking, setLinking] = useState<ParentRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<IssuedCredential | null>(null)

  function handleDelete(parent: ParentRow) {
    if (!confirm(`Delete ${parent.firstName} ${parent.lastName}? Linked student relationships will be removed.`)) {
      return
    }
    setDeletingId(parent.id)
    startTransition(async () => {
      const result = await deleteParent(parent.id)
      setDeletingId(null)
      if (!result.success) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleResetPassword(parent: ParentRow) {
    if (!confirm(`Reset password for ${parent.firstName} ${parent.lastName}?`)) return
    startTransition(async () => {
      const result = await resetParentPassword(parent.id)
      if (!result.success) {
        alert(result.error)
        return
      }
      setCredentials({
        label: 'Parent login',
        username: result.data.username,
        temporaryPassword: result.data.temporaryPassword,
      })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Veliler</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {parents.length} veli &bull; {parents.reduce((sum, p) => sum + p.students.length, 0)} öğrenci eşleşmesi
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Primary registration happens with the student. Use this page to manage and link parents.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold shadow-gold hover:brightness-110 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Veli Ekle & Öğrenci Eşle
        </button>
      </div>

      <div className="grid gap-4">
        {parents.map((parent) => (
          <article
            key={parent.id}
            className={cn(
              'rounded-2xl border border-border bg-card overflow-hidden',
              deletingId === parent.id && 'opacity-50 pointer-events-none'
            )}
          >
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
              <div className="flex items-center gap-2 self-start">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold-dim text-gold border border-gold/30">
                  {parent.students.length} öğrenci
                </span>
                <button
                  type="button"
                  onClick={() => setLinking(parent)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Link student"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleResetPassword(parent)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Reset Password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(parent)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(parent)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
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
                    <a
                      href={`/dashboard/students/${student.id}`}
                      className="text-[11px] text-gold hover:underline underline-offset-4"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {parents.length === 0 && (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Henüz veli yok. Öğrenci kaydı sırasında veli ekleyin veya buradan eşleştirin.
        </div>
      )}

      {createOpen && (
        <ParentFormModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        />
      )}

      {editing && (
        <ParentEditModal
          parent={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}

      {linking && (
        <ParentLinkModal
          parent={linking}
          onClose={() => setLinking(null)}
          onSuccess={() => {
            setLinking(null)
            router.refresh()
          }}
        />
      )}

      {credentials && (
        <CredentialsDialog
          title="Password reset"
          credentials={credentials}
          onDone={() => setCredentials(null)}
        />
      )}
    </div>
  )
}
