import { redirect } from 'next/navigation'
import { requireAcademyId } from '@/lib/session'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'
import { DashboardShell } from '@/app/dashboard/dashboard-shell'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  try {
    const { role } = await requireAcademyId()
    if (role !== 'PARENT' && role !== 'STUDENT' && !isAdminRole(role)) {
      redirect(getDashboardPathForRole(role))
    }
  } catch {
    redirect('/login')
  }

  return <DashboardShell>{children}</DashboardShell>
}
