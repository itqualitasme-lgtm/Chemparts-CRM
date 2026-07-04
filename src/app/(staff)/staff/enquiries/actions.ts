'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { nextEnquiryNo } from '@/lib/enquiry-no'
import type { EnquiryStatus, EnquiryType } from '@/generated/prisma/client'

export type UpdateStatusState = { ok?: boolean; error?: string }
export type CreateEnquiryState = { ok?: boolean; error?: string }

const ENQUIRY_TYPES: EnquiryType[] = [
  'WEBSITE', 'PHONE', 'EMAIL', 'WHATSAPP', 'WALK_IN', 'REFERRAL', 'EXHIBITION', 'TENDER', 'OTHER',
]

type LineInput = { productId: string; qty: number; note?: string }

function parseItems(json: string | null): LineInput[] {
  if (!json) return []
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  const out: LineInput[] = []
  for (const r of raw as LineInput[]) {
    if (r && typeof r.productId === 'string' && r.productId) {
      const qty = Math.max(1, Math.floor(Number(r.qty)) || 1)
      out.push({ productId: r.productId, qty, note: (r.note ?? '').trim() || undefined })
    }
  }
  return out
}

/**
 * Staff create an enquiry for any channel (phone, email, walk-in, tender…).
 * Either attach an existing customer or create a new one inline. At least one
 * product line is required. Generates ENQ-YYYY-NNNN and lands in NEW.
 */
export async function createEnquiry(_prev: CreateEnquiryState, formData: FormData): Promise<CreateEnquiryState> {
  const user = await requirePortal('staff')

  const typeRaw = (formData.get('type') as string | null)?.trim() as EnquiryType | undefined
  const type: EnquiryType = typeRaw && ENQUIRY_TYPES.includes(typeRaw) ? typeRaw : 'PHONE'
  const message = (formData.get('message') as string | null)?.trim() || null
  const items = parseItems(formData.get('itemsJson') as string | null)
  if (items.length === 0) return { error: 'Add at least one product line.' }

  const customerMode = (formData.get('customerMode') as string | null) ?? 'existing'
  let customerId: string | null = null
  let contactName: string | null = (formData.get('contactName') as string | null)?.trim() || null

  if (customerMode === 'existing') {
    customerId = (formData.get('customerId') as string | null)?.trim() || null
    if (!customerId) return { error: 'Choose an existing customer or switch to “new customer”.' }
    const exists = await db.customer.findUnique({ where: { id: customerId }, select: { id: true } })
    if (!exists) return { error: 'Selected customer not found.' }
  } else {
    const companyName = (formData.get('newCompanyName') as string | null)?.trim()
    if (!companyName) return { error: 'Enter the new company name.' }
    const country = (formData.get('newCountry') as string | null)?.trim() || 'United Arab Emirates'
    const email = (formData.get('newEmail') as string | null)?.trim() || null
    const phone = (formData.get('newPhone') as string | null)?.trim() || null
    const created = await db.customer.create({
      data: {
        companyName,
        country,
        email,
        phone,
        source: 'STAFF',
        contacts: contactName
          ? { create: [{ name: contactName, email, phone, isPrimary: true }] }
          : undefined,
      },
      select: { id: true },
    })
    customerId = created.id
  }

  // Snapshot product names for the line items.
  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, name: true },
  })
  const nameById = new Map(products.map((p) => [p.id, p.name]))
  const validItems = items.filter((i) => nameById.has(i.productId))
  if (validItems.length === 0) return { error: 'None of the selected products were found.' }

  const enquiryNo = await nextEnquiryNo()
  const enquiry = await db.enquiry.create({
    data: {
      enquiryNo,
      type,
      customerId,
      contactName,
      createdByProfile: user.id,
      message,
      status: 'NEW',
      items: {
        create: validItems.map((i) => ({
          productId: i.productId,
          productName: nameById.get(i.productId)!,
          qty: i.qty,
          priceRequested: false,
          note: i.note ?? null,
        })),
      },
    },
    select: { id: true },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Enquiry', entityId: enquiry.id, detail: { enquiryNo, type } },
  })

  revalidatePath('/staff/enquiries')
  redirect('/staff/enquiries')
}

const VALID: EnquiryStatus[] = ['NEW', 'UNDER_REVIEW', 'QUOTED', 'WON', 'LOST']

/** Staff move an enquiry through its lifecycle (NEW → UNDER_REVIEW → QUOTED → WON/LOST). */
export async function updateEnquiryStatus(
  enquiryId: string,
  formData: FormData,
): Promise<UpdateStatusState> {
  await requirePortal('staff')

  const status = (formData.get('status') as string | null)?.trim() as EnquiryStatus | undefined
  if (!status || !VALID.includes(status)) {
    return { error: 'Invalid status.' }
  }

  const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true } })
  if (!enquiry) return { error: 'Enquiry not found.' }

  await db.enquiry.update({ where: { id: enquiryId }, data: { status } })

  revalidatePath('/staff/enquiries')
  return { ok: true }
}
