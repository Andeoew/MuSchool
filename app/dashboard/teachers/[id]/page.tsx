import { notFound } from 'next/navigation'
import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'
import { TeacherDetailActions } from './teacher-detail-actions'

export const dynamic = 'force-dynamic'

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { academyId } = await requireAcademyId()
  const db = forAcademy(academyId)

  const teacher = await db.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, mustChangePassword: true } },
      lessons: {
        orderBy: { startTime: 'desc' },
        take: 10,
        include: { student: { select: { firstName: true, lastName: true } } },
      },
    },
  })

  if (!teacher) notFound()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {teacher.firstName} {teacher.lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{teacher.email}</p>
        </div>
        <TeacherDetailActions teacher={teacher} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Instruments" value={teacher.instruments.join(', ') || '—'} />
        <InfoCard label="Phone" value={teacher.phone ?? '—'} />
        <InfoCard label="Status" value={teacher.isActive ? 'Active' : 'Inactive'} />
        <InfoCard label="Login" value={teacher.userId ? 'Enabled' : 'Not created'} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Lessons</h3>
        {teacher.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons scheduled yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {teacher.lessons.map((l) => (
              <li key={l.id} className="text-sm text-foreground flex justify-between">
                <span>
                  {l.subject} with {l.student.firstName} {l.student.lastName}
                </span>
                <span className="text-muted-foreground">{l.startTime.toLocaleDateString()}</span>
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
