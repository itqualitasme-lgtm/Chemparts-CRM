import { requirePortal } from '@/lib/auth/session'
import PortalShell from '@/components/PortalShell'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('vendor')
  return (
    <PortalShell portal="vendor" user={user}>
      {children}
    </PortalShell>
  )
}
