'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'

export type SubmitBillState = { ok?: boolean; error?: string }

const BUCKET = 'product-images' // shared storage bucket used across the app
const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

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

  // Optional invoice file — upload to storage and keep the public URL.
  let fileUrl: string | null = null
  const file = formData.get('file')
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return { error: 'File must be 15MB or smaller.' }
    if (!ALLOWED.includes(file.type)) return { error: 'Use PDF, PNG, JPEG or WEBP.' }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const path = `bills/${user.vendorId}/${Date.now()}.${ext}`
    const supabase = createAdminClient()
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) return { error: `Invoice upload failed: ${upErr.message}` }
    fileUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  await db.bill.create({
    data: {
      billNo,
      vendorId: user.vendorId,
      poId,
      amount,
      currency: vendor?.currency ?? 'USD',
      note,
      fileUrl,
      dueDate: dueRaw ? new Date(dueRaw) : null,
      status: 'SUBMITTED',
      submittedByProfile: user.id,
    },
  })
  revalidatePath('/vendor/bills')
  revalidatePath('/staff/bills')
  return { ok: true }
}
