import { getSessionUser } from '@/lib/auth/session'
import { homePathFor } from '@/lib/auth/rbac'
import { getInstrumentCount } from '@/lib/counts'
import SiteHeaderClient from './SiteHeaderClient'

// Server component: fetches session + instrument count (server-only data) and
// hands them to the client header, which derives the active nav item from the
// current pathname and renders Next <Link>s for instant client-side navigation.
export default async function SiteHeader() {
  const [user, instrumentCount] = await Promise.all([getSessionUser(), getInstrumentCount()])
  const firstName = user ? (user.fullName || '').trim().split(/\s+/)[0] || user.email : ''

  return (
    <SiteHeaderClient
      instrumentCount={instrumentCount}
      firstName={firstName}
      isAuthed={!!user}
      dashboardHref={user ? homePathFor(user.role) : '/'}
    />
  )
}
