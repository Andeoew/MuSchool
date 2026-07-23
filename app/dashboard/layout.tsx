import { redirect } from 'next/navigation'
import { requireAcademyId } from '@/lib/session'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'
import { DashboardShell } from './dashboard-shell'

/**
 * Admin dashboard shell. Non-admins are redirected to their role home.
 * Cookie-only middleware keeps in-dashboard hops fast; this gate runs once
 * per layout render on the server.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const { role } = await requireAcademyId()
    if (!isAdminRole(role)) {
      redirect(getDashboardPathForRole(role))
    }
  } catch {
    redirect('/login')
  }

  return <DashboardShell>{children}</DashboardShell>
}
