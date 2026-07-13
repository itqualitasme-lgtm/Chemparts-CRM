'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

export type ConfirmState = { ok?: boolean; error?: string }

/** A vendor confirms a purchase order that staff have sent to them. */
export async function confirmPurchaseOrder(id: string): Promise<ConfirmState> {
  const user = await requirePortal('vendor')
  if (!user.vendorId) return { error: 'Your account is not linked to a vendor.' }

  const po = await db.purchaseOrder.findFirst({
    where: { id, vendorId: user.vendorId },
    select: { id: true, status: true },
  })
  if (!po) return { error: 'Purchase order not found.' }
  if (po.status !== 'SENT') return { error: 'Only a sent purchase order can be confirmed.' }

  await db.purchaseOrder.update({ where: { id }, data: { status: 'CONFIRMED' } })
  revalidatePath('/vendor/purchase-orders')
  revalidatePath('/staff/purchase-orders')
  return { ok: true }
}
