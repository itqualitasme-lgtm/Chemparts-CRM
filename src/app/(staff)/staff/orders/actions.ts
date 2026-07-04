'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal, requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'
import { nextOrderNo } from '@/lib/order'
import type { OrderStatus, OrderDocKind } from '@/generated/prisma/client'

export type OrderState = { ok?: boolean; error?: string }
export type OrderDocState = { ok?: boolean; error?: string }

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'CLOSED', 'CANCELLED']
const DOC_KINDS: OrderDocKind[] = ['INVOICE', 'WARRANTY', 'PURCHASE_ORDER', 'DELIVERY_NOTE', 'OTHER']

const BUCKET = 'product-images'
const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

/** Create an order from an accepted quotation (one order per quotation). */
export async function createOrderFromQuotation(quotationId: string): Promise<{ error?: string }> {
  const user = await requirePortal('staff')

  const q = await db.quotation.findUnique({
    where: { id: quotationId },
    select: {
      id: true,
      customerId: true,
      currency: true,
      vatPercent: true,
      order: { select: { id: true } },
      items: { orderBy: { sortOrder: 'asc' }, select: { productId: true, productName: true, qty: true, unitPrice: true, discountPct: true } },
    },
  })
  if (!q) return { error: 'Quotation not found.' }
  if (q.order) redirect(`/staff/orders/${q.order.id}`)

  const orderNo = await nextOrderNo()
  const order = await db.order.create({
    data: {
      orderNo,
      quotationId: q.id,
      customerId: q.customerId,
      createdByProfile: user.id,
      status: 'CONFIRMED',
      currency: q.currency,
      vatPercent: q.vatPercent,
      items: {
        create: q.items.map((it, i) => ({
          productId: it.productId,
          productName: it.productName,
          qty: it.qty,
          // carry the discounted (net) unit price into the order
          unitPrice: Number(it.unitPrice) * (1 - Number(it.discountPct) / 100),
          sortOrder: i,
        })),
      },
    },
    select: { id: true },
  })
  await db.quotation.update({ where: { id: q.id }, data: { status: 'ACCEPTED' } })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Order', entityId: order.id, detail: { orderNo, fromQuotation: quotationId } },
  })

  revalidatePath('/staff/orders')
  revalidatePath('/staff/quotations')
  redirect(`/staff/orders/${order.id}`)
}

/** Update an order's status + notes. */
export async function updateOrder(orderId: string, formData: FormData): Promise<OrderState> {
  const user = await requirePortal('staff')
  const statusRaw = (formData.get('status') as string | null)?.trim() as OrderStatus | undefined
  const status = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : undefined
  const notes = (formData.get('notes') as string | null)?.trim() || null

  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true } })
  if (!order) return { error: 'Order not found.' }

  await db.order.update({ where: { id: orderId }, data: { ...(status ? { status } : {}), notes } })
  await db.auditLog.create({ data: { actorId: user.id, action: 'UPDATE', entity: 'Order', entityId: orderId, detail: { status } } })
  revalidatePath('/staff/orders')
  revalidatePath(`/staff/orders/${orderId}`)
  return { ok: true }
}

/** Upload an order document (invoice / warranty / PO / delivery note). */
export async function uploadOrderDocument(
  orderId: string,
  _prev: OrderDocState,
  formData: FormData,
): Promise<OrderDocState> {
  await requirePortal('staff')
  const file = formData.get('file')
  const kindRaw = (formData.get('kind') as string | null)?.trim() as OrderDocKind | undefined
  const kind: OrderDocKind = kindRaw && DOC_KINDS.includes(kindRaw) ? kindRaw : 'OTHER'
  const label = ((formData.get('label') as string | null) ?? '').trim() || kind.replace('_', ' ')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a file.' }
  if (file.size > MAX_BYTES) return { error: 'File must be 15MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PDF, PNG, JPEG or WEBP.' }

  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true } })
  if (!order) return { error: 'Order not found.' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const path = `orders/${orderId}/${kind.toLowerCase()}-${Date.now()}.${ext}`
  const supabase = createAdminClient()
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) return { error: `Upload failed: ${upErr.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  await db.orderDocument.create({ data: { orderId, kind, label, url: data.publicUrl } })
  revalidatePath(`/staff/orders/${orderId}`)
  return { ok: true }
}

export async function removeOrderDocument(docId: string): Promise<void> {
  await requirePortal('staff')
  const doc = await db.orderDocument.findUnique({ where: { id: docId }, select: { url: true, orderId: true } })
  if (!doc) return
  await db.orderDocument.delete({ where: { id: docId } })
  const marker = `/${BUCKET}/`
  const idx = doc.url.indexOf(marker)
  if (idx !== -1) {
    try {
      await createAdminClient().storage.from(BUCKET).remove([doc.url.slice(idx + marker.length)])
    } catch {
      // ignore cleanup failures
    }
  }
  revalidatePath(`/staff/orders/${doc.orderId}`)
}

/** Admin-only: delete an order (items + documents cascade). */
export async function deleteOrder(orderId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can delete orders.' }
  const order = await db.order.findUnique({ where: { id: orderId }, select: { documents: { select: { url: true } } } })
  if (!order) return { error: 'Order not found.' }
  const paths = order.documents
    .map((d) => {
      const i = d.url.indexOf(`/${BUCKET}/`)
      return i === -1 ? null : d.url.slice(i + BUCKET.length + 2)
    })
    .filter((x): x is string => !!x)
  if (paths.length) {
    try {
      await createAdminClient().storage.from(BUCKET).remove(paths)
    } catch {
      // ignore
    }
  }
  await db.order.delete({ where: { id: orderId } })
  await db.auditLog.create({ data: { actorId: admin.id, action: 'DELETE', entity: 'Order', entityId: orderId } })
  revalidatePath('/staff/orders')
  return {}
}
