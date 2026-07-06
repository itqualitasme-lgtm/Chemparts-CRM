'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

/** Mark one notification read, recording who cleared it. */
export async function markNotificationRead(id: string): Promise<void> {
  const user = await requirePortal('staff')
  await db.notification.updateMany({
    where: { id, readAt: null },
    data: { readAt: new Date(), readById: user.id, readByName: user.fullName },
  })
  revalidatePath('/staff')
  revalidatePath('/admin')
}

/** Mark all unread notifications read (by the current staff user). */
export async function markAllNotificationsRead(): Promise<void> {
  const user = await requirePortal('staff')
  await db.notification.updateMany({
    where: { readAt: null },
    data: { readAt: new Date(), readById: user.id, readByName: user.fullName },
  })
  revalidatePath('/staff')
  revalidatePath('/admin')
}
