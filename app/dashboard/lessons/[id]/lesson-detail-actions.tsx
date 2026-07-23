'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { LessonFormModal, type LessonFormValues } from '../lesson-form-modal'

type Props = {
  lesson: LessonFormValues
}

export function LessonDetailActions({ lesson }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {open && (
        <LessonFormModal
          mode="edit"
          lesson={lesson}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
