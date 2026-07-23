'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { CourseFormModal, type CourseFormValues } from '../course-form-modal'

export function CourseDetailActions({ course }: { course: CourseFormValues }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {open && (
        <CourseFormModal
          mode="edit"
          course={course}
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
