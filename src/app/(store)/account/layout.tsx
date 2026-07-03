import { requirePortal } from '@/lib/auth/session'
import PortalShell from '@/components/PortalShell'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('store')
  return (
    <PortalShell portal="store" user={user}>
      {children}
    </PortalShell>
  )
}
