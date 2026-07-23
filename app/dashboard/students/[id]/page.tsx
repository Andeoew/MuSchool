import { notFound } from 'next/navigation'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { StudentDetailActions } from './student-detail-actions'

export const dynamic = 'force-dynamic'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const student = await db.student.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { startTime: 'desc' },
        take: 10,
        include: { teacher: { select: { firstName: true, lastName: true } } },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  // findUnique above is already academyId-scoped by forAcademy(), so this
  // also correctly 404s if the id belongs to a different academy.
  if (!student) notFound()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{student.email ?? 'No email on file'}</p>
        </div>
        <StudentDetailActions student={student} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Instrument" value={student.instrument ?? '—'} />
        <InfoCard label="Level" value={student.level ?? '—'} />
        <InfoCard label="Phone" value={student.phone ?? '—'} />
        <InfoCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Lessons</h3>
        {student.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons scheduled yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {student.lessons.map((l) => (
              <li key={l.id} className="text-sm text-foreground flex justify-between">
                <span>
                  {l.subject} with {l.teacher.firstName} {l.teacher.lastName}
                </span>
                <span className="text-muted-foreground">{l.startTime.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Payments</h3>
        {student.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment records yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {student.payments.map((p) => (
              <li key={p.id} className="text-sm text-foreground flex justify-between">
                <span>{p.description ?? p.status}</span>
                <span className="text-muted-foreground">
                  {p.amount} {p.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
    </div>
  )
}
