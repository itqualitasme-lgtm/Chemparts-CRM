'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

/** Toggle a subscriber active (subscribed) / inactive (unsubscribed). */
export async function toggleSubscriber(id: string, active: boolean): Promise<void> {
  await requirePortal('staff')
  await db.subscriber.update({ where: { id }, data: { active } })
  revalidatePath('/staff/subscribers')
}

/** Permanently remove a subscriber. */
export async function removeSubscriber(id: string): Promise<void> {
  await requirePortal('staff')
  await db.subscriber.delete({ where: { id } })
  revalidatePath('/staff/subscribers')
}
