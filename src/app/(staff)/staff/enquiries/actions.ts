'use server'

import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePortal, requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { nextEnquiryNo } from '@/lib/enquiry-no'
import { notify } from '@/lib/mail/notify'
import { appUrl } from '@/lib/env'
import type { EnquiryStatus, EnquiryType } from '@/generated/prisma/client'

export type UpdateStatusState = { ok?: boolean; error?: string }
export type AssignState = { ok?: boolean; error?: string }

/** Assign (or clear) the sales person on an enquiry; email them when assigned. */
export async function assignSalesPerson(enquiryId: string, salesPersonId: string): Promise<AssignState> {
  await requirePortal('staff')
  const spId = salesPersonId.trim() || null
  const enquiry = await db.enquiry.findUnique({
    where: { id: enquiryId },
    select: { enquiryNo: true, guestName: true, guestCompany: true, salesPersonId: true, customer: { select: { companyName: true } } },
  })
  if (!enquiry) return { error: 'Enquiry not found.' }
  const changed = spId !== enquiry.salesPersonId

  await db.enquiry.update({ where: { id: enquiryId }, data: { salesPersonId: spId } })

  if (changed && spId) {
    const sp = await db.salesPerson.findUnique({ where: { id: spId }, select: { name: true, email: true, active: true } })
    if (sp?.email && sp.active) {
      const who = enquiry.customer?.companyName ?? enquiry.guestCompany ?? enquiry.guestName ?? 'A customer'
      after(() => notify(sp.email, 'enquiry-assigned', { name: sp.name, enquiryNo: enquiry.enquiryNo, who, link: `${appUrl()}/staff/enquiries` }))
    }
  }
  revalidatePath('/staff/enquiries')
  return { ok: true }
}
export type CreateEnquiryState = { ok?: boolean; error?: string }

/** Admin-only: delete an enquiry (line items cascade). */
export async function deleteEnquiry(enquiryId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can delete enquiries.' }
  const e = await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true } })
  if (!e) return { error: 'Enquiry not found.' }
  await db.enquiry.delete({ where: { id: enquiryId } })
  await db.auditLog.create({ data: { actorId: admin.id, action: 'DELETE', entity: 'Enquiry', entityId: enquiryId } })
  revalidatePath('/staff/enquiries')
  return {}
}

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
  const contactName: string | null = (formData.get('contactName') as string | null)?.trim() || null
  let salesPersonId: string | null = (formData.get('salesPersonId') as string | null)?.trim() || null

  if (customerMode === 'existing') {
    customerId = (formData.get('customerId') as string | null)?.trim() || null
    if (!customerId) return { error: 'Choose an existing customer or switch to “new customer”.' }
    const exists = await db.customer.findUnique({ where: { id: customerId }, select: { id: true, salesPersonId: true } })
    if (!exists) return { error: 'Selected customer not found.' }
    // Fall back to the customer's default sales person if none chosen.
    if (!salesPersonId) salesPersonId = exists.salesPersonId
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
        salesPersonId,
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
      salesPersonId,
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

const VALID: EnquiryStatus[] = ['NEW', 'UNDER_REVIEW', 'QUOTED', 'WON', 'LOST', 'SPAM']

/** Staff one-click reject: mark an enquiry as spam. Never notifies the sender. */
export async function rejectAsSpam(enquiryId: string): Promise<UpdateStatusState> {
  const user = await requirePortal('staff')
  const e = await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true, enquiryNo: true } })
  if (!e) return { error: 'Enquiry not found.' }
  await db.enquiry.update({ where: { id: enquiryId }, data: { status: 'SPAM', lostReason: null } })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'UPDATE', entity: 'Enquiry', entityId: enquiryId, detail: { status: 'SPAM', enquiryNo: e.enquiryNo } },
  })
  revalidatePath('/staff/enquiries')
  return { ok: true }
}

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

  const enquiry = await db.enquiry.findUnique({
    where: { id: enquiryId },
    select: {
      id: true,
      status: true,
      enquiryNo: true,
      guestName: true,
      guestEmail: true,
      customer: { select: { companyName: true, email: true, contacts: { where: { isPrimary: true }, take: 1, select: { email: true } } } },
    },
  })
  if (!enquiry) return { error: 'Enquiry not found.' }

  // Capture a reason when marking LOST; clear it if moving away from LOST.
  const reasonRaw = (formData.get('lostReason') as string | null)?.trim() || null
  if (status === 'LOST' && !reasonRaw) {
    return { error: 'Add a reason for marking this enquiry lost.' }
  }
  const lostReason = status === 'LOST' ? reasonRaw : null

  await db.enquiry.update({ where: { id: enquiryId }, data: { status, lostReason } })

  // Tell the customer about meaningful status changes (not internal LOST/SPAM).
  if (status !== enquiry.status && status !== 'LOST' && status !== 'SPAM' && status !== 'NEW') {
    const to = enquiry.guestEmail ?? enquiry.customer?.email ?? enquiry.customer?.contacts[0]?.email
    const name = enquiry.guestName ?? enquiry.customer?.companyName ?? 'there'
    after(() => notify(to, 'enquiry-status-update', { name, enquiryNo: enquiry.enquiryNo, status: status.replace(/_/g, ' ') }))
  }

  revalidatePath('/staff/enquiries')
  return { ok: true }
}
