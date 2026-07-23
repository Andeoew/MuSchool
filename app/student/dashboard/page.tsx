import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const { academyId, role } = await requireAcademyId()
  const db = forAcademy(academyId)

  const students = await db.student.findMany({
    where: { isActive: true },
    take: 5,
    orderBy: { enrolledAt: 'desc' },
    select: {
      firstName: true,
      lastName: true,
      instrument: true,
      level: true,
    },
  })

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          {role === 'PARENT' ? 'Veli Paneli' : 'Öğrenci Paneli'}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {role === 'PARENT'
            ? 'Eşleşmiş öğrencilerinizin ders ve devam bilgilerini buradan takip edebilirsiniz.'
            : 'Ders programınız ve ödevleriniz burada görünecek.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Akademi Öğrencileri</h3>
        </div>
        {students.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Henüz kayıtlı öğrenci yok.</p>
        ) : (
          <ul className="divide-y divide-border">
            {students.map((student) => (
              <li key={`${student.firstName}-${student.lastName}`} className="px-5 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-muted-foreground text-[12px]">
                  {[student.instrument, student.level].filter(Boolean).join(' · ') || 'Branş belirtilmemiş'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
