import { redirect } from 'next/navigation'
import { isAuthFailure, requireAcademyId } from '@/lib/session'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'
import { DashboardShell } from '@/app/dashboard/dashboard-shell'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  try {
    const { role } = await requireAcademyId()
    if (role !== 'TEACHER' && !isAdminRole(role)) {
      redirect(getDashboardPathForRole(role))
    }
  } catch (err) {
    if (isAuthFailure(err)) redirect('/login')
    throw err
  }

  return <DashboardShell>{children}</DashboardShell>
}
