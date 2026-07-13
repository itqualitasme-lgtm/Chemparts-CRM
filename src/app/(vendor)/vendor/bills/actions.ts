'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

export type SubmitBillState = { ok?: boolean; error?: string }

/** A vendor submits an invoice (bill) against one of their purchase orders. */
export async function submitBill(_prev: SubmitBillState, formData: FormData): Promise<SubmitBillState> {
  const user = await requirePortal('vendor')
  if (!user.vendorId) return { error: 'Your account is not linked to a vendor.' }

  const billNo = (formData.get('billNo') as string | null)?.trim()
  if (!billNo) return { error: 'Enter your invoice number.' }

  const amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Enter a valid amount.' }

  const poId = (formData.get('poId') as string | null)?.trim() || null
  // Guard: a linked PO must belong to this vendor.
  if (poId) {
    const po = await db.purchaseOrder.findFirst({ where: { id: poId, vendorId: user.vendorId }, select: { id: true } })
    if (!po) return { error: 'That purchase order was not found.' }
  }

  const vendor = await db.vendor.findUnique({ where: { id: user.vendorId }, select: { currency: true } })
  const dueRaw = (formData.get('dueDate') as string | null)?.trim()
  const note = (formData.get('note') as string | null)?.trim() || null

  await db.bill.create({
    data: {
      billNo,
      vendorId: user.vendorId,
      poId,
      amount,
      currency: vendor?.currency ?? 'USD',
      note,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      status: 'SUBMITTED',
      submittedByProfile: user.id,
    },
  })
  revalidatePath('/vendor/bills')
  revalidatePath('/staff/bills')
  return { ok: true }
}
