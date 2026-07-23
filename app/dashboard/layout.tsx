import { redirect } from 'next/navigation'
import { isAuthFailure, requireAcademyId } from '@/lib/session'
import { getDashboardPathForRole, isAdminRole } from '@/lib/auth-utils'
import { DashboardShell } from './dashboard-shell'

/**
 * Admin dashboard shell. Non-admins are redirected to their role home.
 * Cookie-only middleware keeps in-dashboard hops fast; this gate runs once
 * per layout render on the server (deduped with page via React.cache).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const { role } = await requireAcademyId()
    if (!isAdminRole(role)) {
      redirect(getDashboardPathForRole(role))
    }
  } catch (err) {
    if (isAuthFailure(err)) redirect('/login')
    throw err
  }

  return <DashboardShell>{children}</DashboardShell>
}
