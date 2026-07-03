import { getSessionUser } from '@/lib/auth/session'
import { homePathFor } from '@/lib/auth/rbac'
import { HeaderClient, type HeaderUser } from './HeaderClient'

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Public marketing/store header. Server component — reads the session. */
export async function PublicHeader() {
  const user = await getSessionUser()

  const headerUser: HeaderUser | null = user
    ? {
        firstName: user.fullName.trim().split(/\s+/)[0] || user.email,
        initials: initialsFrom(user.fullName || user.email),
        dashboardPath: homePathFor(user.role),
      }
    : null

  return <HeaderClient user={headerUser} />
}

export default PublicHeader
