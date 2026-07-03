import { requirePortal } from '@/lib/auth/session'
import PortalShell from '@/components/PortalShell'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('staff')
  return (
    <PortalShell portal="staff" user={user}>
      {children}
    </PortalShell>
  )
}
