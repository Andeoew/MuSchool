'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import type { Teacher } from '@prisma/client'
import { deleteTeacher, resetTeacherPassword } from '@/actions/teacher'
import { TeacherFormModal } from '../teacher-form-modal'
import { CredentialsDialog, type IssuedCredential } from '@/components/credentials-dialog'

export function TeacherDetailActions({ teacher }: { teacher: Teacher }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [credentials, setCredentials] = useState<IssuedCredential | null>(null)

  function handleDelete() {
    if (!confirm('Delete this teacher? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteTeacher(teacher.id)
      if (!result.success) {
        alert(result.error)
        return
      }
      router.push('/dashboard/teachers')
    })
  }

  function handleResetPassword() {
    if (!confirm(`Reset password for ${teacher.firstName} ${teacher.lastName}?`)) return
    startTransition(async () => {
      const result = await resetTeacherPassword(teacher.id)
      if (!result.success) {
        alert(result.error)
        return
      }
      setCredentials({
        label: 'Teacher login',
        username: result.data.username,
        temporaryPassword: result.data.temporaryPassword,
      })
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={handleResetPassword}
        disabled={isPending}
        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        title="Reset Password"
      >
        <KeyRound className="w-4 h-4" />
      </button>
      <button
        onClick={() => setEditing(true)}
        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 rounded-xl border border-border text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {editing && (
        <TeacherFormModal
          mode="edit"
          teacher={{
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            instruments: teacher.instruments,
            isActive: teacher.isActive,
            hasLogin: Boolean(teacher.userId),
            hiredAt: '',
          }}
          onClose={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false)
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
