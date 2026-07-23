import { requireAcademyId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const { role } = await requireAcademyId()

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Eğitmen Paneli</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ders programınız, öğrencileriniz ve devam kayıtlarınız burada görünecek.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Rolünüz: <span className="font-medium text-foreground">{role}</span>
      </div>
    </div>
  )
}
