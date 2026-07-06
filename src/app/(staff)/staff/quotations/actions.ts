'use server'

import { randomBytes } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal, requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { nextQuotationNo } from '@/lib/quotation'
import type { QuotationStatus } from '@/generated/prisma/client'

/** URL-safe token for the public (no-login) quotation view. */
function publicToken(): string {
  return randomBytes(18).toString('base64url')
}

export type QuotationState = { ok?: boolean; error?: string }

const STATUSES: QuotationStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']

type LineInput = { productId?: string | null; productName: string; qty: number; unitPrice: number; discountPct: number; note?: string }

function parseLines(json: string | null): LineInput[] {
  if (!json) return []
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  const out: LineInput[] = []
  for (const r of raw as (LineInput & { discountPct?: number })[]) {
    const name = (r?.productName ?? '').trim()
    if (!name) continue
    const dp = Number(r.discountPct)
    out.push({
      productId: r.productId || null,
      productName: name,
      qty: Math.max(1, Math.floor(Number(r.qty)) || 1),
      unitPrice: Math.max(0, Number(r.unitPrice) || 0),
      discountPct: Number.isFinite(dp) ? Math.min(100, Math.max(0, dp)) : 0,
      note: (r.note ?? '').trim() || undefined,
    })
  }
  return out
}

function num(fd: FormData, key: string): number {
  const n = Number(fd.get(key))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * Create a DRAFT quotation from an enquiry — copies the enquiry's line items,
 * seeding each unit price from the product's current list price. Marks the
 * enquiry QUOTED and opens the new quotation for pricing.
 */
export async function createQuotationFromEnquiry(enquiryId: string): Promise<{ error?: string }> {
  const user = await requirePortal('staff')

  const enquiry = await db.enquiry.findUnique({
    where: { id: enquiryId },
    select: {
      id: true,
      customerId: true,
      salesPersonId: true,
      items: {
        select: {
          productId: true,
          productName: true,
          qty: true,
          product: { select: { listPrice: true, currency: true } },
        },
      },
    },
  })
  if (!enquiry) return { error: 'Enquiry not found.' }

  const currency = enquiry.items[0]?.product?.currency ?? 'AED'
  const quotationNo = await nextQuotationNo()

  const quotation = await db.quotation.create({
    data: {
      quotationNo,
      enquiryId: enquiry.id,
      customerId: enquiry.customerId,
      createdByProfile: user.id,
      status: 'DRAFT',
      currency,
      vatPercent: 5,
      salesPersonId: enquiry.salesPersonId,
      publicToken: publicToken(),
      items: {
        create: enquiry.items.map((it, i) => ({
          productId: it.productId,
          productName: it.productName,
          qty: it.qty,
          unitPrice: it.product?.listPrice ?? 0,
          sortOrder: i,
        })),
      },
    },
    select: { id: true },
  })

  await db.enquiry.update({ where: { id: enquiry.id }, data: { status: 'QUOTED' } })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Quotation', entityId: quotation.id, detail: { quotationNo, fromEnquiry: enquiryId } },
  })

  revalidatePath('/staff/quotations')
  revalidatePath('/staff/enquiries')
  redirect(`/staff/quotations/${quotation.id}`)
}

/** Update a quotation's header fields + line items (items replaced wholesale). */
export async function updateQuotation(
  quotationId: string,
  _prev: QuotationState,
  formData: FormData,
): Promise<QuotationState> {
  const user = await requirePortal('staff')

  const existing = await db.quotation.findUnique({ where: { id: quotationId }, select: { id: true, publicToken: true } })
  if (!existing) return { error: 'Quotation not found.' }

  const statusRaw = (formData.get('status') as string | null)?.trim() as QuotationStatus | undefined
  const status = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : 'DRAFT'
  const currency = (formData.get('currency') as string | null)?.trim() || 'AED'
  const vatRaw = Number(formData.get('vatPercent'))
  const vatPercent = Number.isFinite(vatRaw) && vatRaw >= 0 ? vatRaw : 5
  const validUntilRaw = (formData.get('validUntil') as string | null)?.trim()
  const validUntil = validUntilRaw ? new Date(validUntilRaw) : null
  const notes = (formData.get('notes') as string | null)?.trim() || null
  const terms = (formData.get('terms') as string | null)?.trim() || null
  const deliveryTerms = (formData.get('deliveryTerms') as string | null)?.trim() || null
  const lines = parseLines(formData.get('itemsJson') as string | null)
  if (lines.length === 0) return { error: 'A quotation needs at least one line item.' }

  await db.$transaction([
    db.quotationItem.deleteMany({ where: { quotationId } }),
    db.quotation.update({
      where: { id: quotationId },
      data: {
        status,
        currency,
        vatPercent,
        validUntil: validUntil && !Number.isNaN(validUntil.getTime()) ? validUntil : null,
        notes,
        terms,
        deliveryTerms,
        shipping: num(formData, 'shipping'),
        otherCharges: num(formData, 'otherCharges'),
        otherChargesLabel: (formData.get('otherChargesLabel') as string | null)?.trim() || null,
        salesPersonId: (formData.get('salesPersonId') as string | null)?.trim() || null,
        companyBranchId: (formData.get('companyBranchId') as string | null)?.trim() || null,
        publicToken: existing.publicToken ?? publicToken(),
        items: {
          create: lines.map((l, i) => ({
            productId: l.productId ?? null,
            productName: l.productName,
            qty: l.qty,
            unitPrice: l.unitPrice,
            discountPct: l.discountPct,
            note: l.note ?? null,
            sortOrder: i,
          })),
        },
      },
    }),
  ])

  await db.auditLog.create({
    data: { actorId: user.id, action: 'UPDATE', entity: 'Quotation', entityId: quotationId, detail: { status } },
  })

  revalidatePath('/staff/quotations')
  revalidatePath(`/staff/quotations/${quotationId}`)
  return { ok: true }
}

/** Admin-only: delete a quotation (line items cascade). */
export async function deleteQuotation(quotationId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can delete quotations.' }
  const q = await db.quotation.findUnique({ where: { id: quotationId }, select: { id: true } })
  if (!q) return { error: 'Quotation not found.' }
  await db.quotation.delete({ where: { id: quotationId } })
  await db.auditLog.create({ data: { actorId: admin.id, action: 'DELETE', entity: 'Quotation', entityId: quotationId } })
  revalidatePath('/staff/quotations')
  return {}
}
