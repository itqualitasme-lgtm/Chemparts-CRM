import 'server-only'
import { cache } from 'react'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, type Portal, type Role } from './rbac'

export type SessionUser = {
  id: string
  email: string
  fullName: string
  role: Role
  customerId: string | null
  vendorId: string | null
}

/** A profile seen within this window counts as "online". */
export const ONLINE_WINDOW_MINUTES = 5
/** Only re-stamp lastSeenAt this often, so we don't write on every request. */
const HEARTBEAT_THROTTLE_MS = 2 * 60_000

// Wrapped in React.cache so the layout, page and any actions in a single
// request share ONE Supabase auth call + Profile query instead of repeating it.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.status !== 'ACTIVE') return null

  // Presence heartbeat: refresh lastSeenAt at most every couple of minutes, and
  // never block the response on it.
  const seen = profile.lastSeenAt?.getTime() ?? 0
  if (Date.now() - seen > HEARTBEAT_THROTTLE_MS) {
    after(async () => {
      await db.profile.update({ where: { id: profile.id }, data: { lastSeenAt: new Date() } }).catch(() => {})
    })
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    customerId: profile.customerId,
    vendorId: profile.vendorId,
  }
})

/** Call at the top of each protected route-group layout. */
export async function requirePortal(portal: Portal): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect(portal === 'store' ? '/login' : `/${portal === 'admin' ? 'staff' : portal}/login`)
  if (!canAccessPortal(user.role, portal)) redirect(homePathFor(user.role))
  return user
}

/**
 * For destructive server actions restricted to admins. Returns the admin user,
 * or null if the caller is not an ADMIN (the action should return an error).
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  return user && user.role === 'ADMIN' ? user : null
}
