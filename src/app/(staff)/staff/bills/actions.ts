'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { notify } from '@/lib/mail/notify'
import { appUrl } from '@/lib/env'
import type { BillStatus } from '@/generated/prisma/client'

export type BillState = { ok?: boolean; error?: string }

const STATUSES: BillStatus[] = ['SUBMITTED', 'APPROVED', 'PAID', 'REJECTED']

/** Staff move a vendor-submitted bill through approval and payment. */
export async function setBillStatus(id: string, status: string): Promise<BillState> {
  await requirePortal('staff')
  if (!STATUSES.includes(status as BillStatus)) return { error: 'Invalid status.' }
  const next = status as BillStatus
  const bill = await db.bill.findUnique({
    where: { id },
    select: {
      id: true, status: true, billNo: true, amount: true, currency: true,
      vendor: { select: { profiles: { where: { status: 'ACTIVE' }, select: { email: true } } } },
    },
  })
  if (!bill) return { error: 'Bill not found.' }

  await db.bill.update({ where: { id }, data: { status: next } })

  // Tell the vendor when their bill is approved, paid, or rejected.
  if (next !== bill.status && next !== 'SUBMITTED') {
    const amountStr = `${bill.currency} ${Number(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const link = `${appUrl()}/vendor/bills`
    for (const p of bill.vendor.profiles) {
      after(() => notify(p.email, 'bill-status', { billNo: bill.billNo, amount: amountStr, status: next, link }))
    }
  }

  revalidatePath('/staff/bills')
  revalidatePath('/vendor/bills')
  return { ok: true }
}
