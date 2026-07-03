import { requirePortal } from '@/lib/auth/session'
import PortalShell from '@/components/PortalShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('admin')
  return (
    <PortalShell portal="admin" user={user}>
      {children}
    </PortalShell>
  )
}
