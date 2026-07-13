'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { UserStatus, Role } from '@/generated/prisma/client'

export type UserActionState = { ok?: boolean; error?: string }

const STATUSES: UserStatus[] = ['PENDING', 'ACTIVE', 'DISABLED']
const ROLES: Role[] = ['ADMIN', 'STAFF', 'CUSTOMER', 'VENDOR']

/** Admin sets a user's account status (approve pending, or disable/re-enable). */
export async function setUserStatus(id: string, status: string): Promise<UserActionState> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can manage users.' }
  if (id === admin.id) return { error: 'You can’t change your own account status.' }
  if (!STATUSES.includes(status as UserStatus)) return { error: 'Invalid status.' }

  const target = await db.profile.findUnique({ where: { id }, select: { id: true } })
  if (!target) return { error: 'User not found.' }

  await db.profile.update({ where: { id }, data: { status: status as UserStatus } })
  await db.auditLog.create({
    data: { actorId: admin.id, action: 'UPDATE', entity: 'Profile', entityId: id, detail: { status } },
  })
  revalidatePath('/admin/users')
  return { ok: true }
}

/** Admin changes a user's role. Self-demotion is blocked to avoid lockout. */
export async function setUserRole(id: string, role: string): Promise<UserActionState> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can manage users.' }
  if (id === admin.id) return { error: 'You can’t change your own role.' }
  if (!ROLES.includes(role as Role)) return { error: 'Invalid role.' }

  const target = await db.profile.findUnique({ where: { id }, select: { id: true } })
  if (!target) return { error: 'User not found.' }

  await db.profile.update({ where: { id }, data: { role: role as Role } })
  await db.auditLog.create({
    data: { actorId: admin.id, action: 'UPDATE', entity: 'Profile', entityId: id, detail: { role } },
  })
  revalidatePath('/admin/users')
  return { ok: true }
}
