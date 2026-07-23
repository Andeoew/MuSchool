'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { Student } from '@prisma/client'
import { deleteStudent } from '../actions'
import { StudentFormModal } from '../student-form-modal'

export function StudentDetailActions({ student }: { student: Student }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  function handleDelete() {
    if (!confirm('Delete this student? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteStudent(student.id)
      if (!result.success) {
        alert(result.error)
        return
      }
      router.push('/dashboard/students')
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
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
        <StudentFormModal
          mode="edit"
          student={{
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            instrument: student.instrument,
            level: student.level,
            teacher: null,
            isActive: student.isActive,
            joined: '',
          }}
          onClose={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
