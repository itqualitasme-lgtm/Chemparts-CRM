import 'server-only'
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

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.status !== 'ACTIVE') return null
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    customerId: profile.customerId,
    vendorId: profile.vendorId,
  }
}

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
