import { forAcademy } from '@/lib/tenant-db'
import { requireAcademyId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const { academyId, userId, role } = await requireAcademyId()
  const db = forAcademy(academyId)

  let students: Array<{
    firstName: string
    lastName: string
    instrument: string | null
    level: string | null
  }> = []

  if (role === 'PARENT') {
    const parent = await db.parent.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (parent) {
      const links = await db.parentStudent.findMany({
        where: { parentId: parent.id },
        take: 20,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              instrument: true,
              level: true,
              isActive: true,
            },
          },
        },
      })
      students = links
        .filter((l) => l.student.isActive)
        .map((l) => l.student)
    }
  } else if (role === 'STUDENT') {
    const self = await db.student.findFirst({
      where: { userId, isActive: true },
      select: {
        firstName: true,
        lastName: true,
        instrument: true,
        level: true,
      },
    })
    if (self) students = [self]
  }

  const listTitle =
    role === 'PARENT' ? 'Bağlı Öğrenciler' : role === 'STUDENT' ? 'Profiliniz' : 'Öğrenciler'

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
          <h3 className="text-sm font-semibold text-foreground">{listTitle}</h3>
        </div>
        {students.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">
            {role === 'PARENT'
              ? 'Henüz bağlı öğrenci yok.'
              : 'Öğrenci profili bulunamadı.'}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {students.map((student) => (
              <li key={`${student.firstName}-${student.lastName}`} className="px-5 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-muted-foreground text-[12px]">
                  {[student.instrument, student.level].filter(Boolean).join(' · ') ||
                    'Branş belirtilmemiş'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
