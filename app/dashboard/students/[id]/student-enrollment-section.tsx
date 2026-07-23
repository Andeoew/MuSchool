'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { EnrollStudentModal } from './enroll-student-modal'
import {
  ENROLLMENT_STATUS_LABELS,
  type EnrollmentStatusValue,
} from '@/lib/validations/enrollment'
import { formatDateShort } from '@/lib/format-date'

type EnrollmentRow = {
  id: string
  status: string
  startDate: string
  course: { id: string; name: string; instrument: string; color: string }
  teacher: { id: string; firstName: string; lastName: string }
}

export function StudentEnrollmentSection({
  studentId,
  studentName,
  enrollments,
}: {
  studentId: string
  studentName: string
  enrollments: EnrollmentRow[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Courses</h3>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline underline-offset-4"
        >
          <Plus className="w-3.5 h-3.5" />
          Enroll Student
        </button>
      </div>
      {enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not enrolled in any courses yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {enrollments.map((e) => (
            <li key={e.id} className="text-sm flex justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/courses/${e.course.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-gold"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.course.color }} />
                  {e.course.name}
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  {e.course.instrument} · {e.teacher.firstName} {e.teacher.lastName} ·{' '}
                  {ENROLLMENT_STATUS_LABELS[e.status as EnrollmentStatusValue] ?? e.status}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-[12px]">
                {formatDateShort(new Date(e.startDate))}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <EnrollStudentModal
          studentId={studentId}
          studentName={studentName}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
