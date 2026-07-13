'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { BillStatus } from '@/generated/prisma/client'

export type BillState = { ok?: boolean; error?: string }

const STATUSES: BillStatus[] = ['SUBMITTED', 'APPROVED', 'PAID', 'REJECTED']

/** Staff move a vendor-submitted bill through approval and payment. */
export async function setBillStatus(id: string, status: string): Promise<BillState> {
  await requirePortal('staff')
  if (!STATUSES.includes(status as BillStatus)) return { error: 'Invalid status.' }
  const bill = await db.bill.findUnique({ where: { id }, select: { id: true } })
  if (!bill) return { error: 'Bill not found.' }
  await db.bill.update({ where: { id }, data: { status: status as BillStatus } })
  revalidatePath('/staff/bills')
  revalidatePath('/vendor/bills')
  return { ok: true }
}
