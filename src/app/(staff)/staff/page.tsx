import { getSessionUser } from '@/lib/auth/session'
import { getDashboardData } from '@/lib/dashboard'
import PortalDashboard from '@/components/PortalDashboard'

export const metadata = { title: 'Staff Dashboard - Chemparts' }
export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const [user, data] = await Promise.all([getSessionUser(), getDashboardData()])
  return <PortalDashboard data={data} firstName={user?.fullName?.split(' ')[0] ?? ''} title="Staff dashboard" />
}
