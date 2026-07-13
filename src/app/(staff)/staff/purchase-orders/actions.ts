'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { nextPoNo } from '@/lib/po-no'
import type { PurchaseOrderStatus } from '@/generated/prisma/client'

export type POState = { ok?: boolean; error?: string }

const STATUSES: PurchaseOrderStatus[] = ['DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED']

type LineInput = { description: string; qty: number; unitCost: number }

function parseItems(json: string | null): LineInput[] {
  if (!json) return []
  let raw: unknown
  try { raw = JSON.parse(json) } catch { return [] }
  if (!Array.isArray(raw)) return []
  const out: LineInput[] = []
  for (const r of raw as LineInput[]) {
    const description = (r?.description ?? '').toString().trim()
    if (!description) continue
    out.push({
      description,
      qty: Math.max(1, Math.floor(Number(r.qty)) || 1),
      unitCost: Math.max(0, Number(r.unitCost) || 0),
    })
  }
  return out
}

/** Staff raise a purchase order to a vendor (starts as DRAFT). */
export async function createPurchaseOrder(_prev: POState, formData: FormData): Promise<POState> {
  const user = await requirePortal('staff')

  const vendorId = (formData.get('vendorId') as string | null)?.trim()
  if (!vendorId) return { error: 'Choose a vendor.' }
  const vendor = await db.vendor.findUnique({ where: { id: vendorId }, select: { id: true, currency: true } })
  if (!vendor) return { error: 'Vendor not found.' }

  const items = parseItems(formData.get('itemsJson') as string | null)
  if (items.length === 0) return { error: 'Add at least one line item.' }

  const expectedRaw = (formData.get('expectedDate') as string | null)?.trim()
  const notes = (formData.get('notes') as string | null)?.trim() || null

  const poNo = await nextPoNo()
  await db.purchaseOrder.create({
    data: {
      poNo,
      vendorId,
      currency: vendor.currency,
      expectedDate: expectedRaw ? new Date(expectedRaw) : null,
      notes,
      status: 'DRAFT',
      createdByProfile: user.id,
      items: {
        create: items.map((it, i) => ({ description: it.description, qty: it.qty, unitCost: it.unitCost, sortOrder: i })),
      },
    },
  })
  revalidatePath('/staff/purchase-orders')
  return { ok: true }
}

/** Staff move a PO through its lifecycle. */
export async function setPOStatus(id: string, status: string): Promise<POState> {
  await requirePortal('staff')
  if (!STATUSES.includes(status as PurchaseOrderStatus)) return { error: 'Invalid status.' }
  const po = await db.purchaseOrder.findUnique({ where: { id }, select: { id: true } })
  if (!po) return { error: 'Purchase order not found.' }
  await db.purchaseOrder.update({ where: { id }, data: { status: status as PurchaseOrderStatus } })
  revalidatePath('/staff/purchase-orders')
  revalidatePath('/vendor/purchase-orders')
  return { ok: true }
}
