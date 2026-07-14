'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { StockStatus } from '@/generated/prisma/client'

const VALID: StockStatus[] = ['IN_STOCK', 'OUT_OF_STOCK', 'ON_ORDER']

/** Staff quick-set a product's stock status from the Stock board. */
export async function setStockStatus(productId: string, status: string): Promise<{ ok?: boolean; error?: string }> {
  await requirePortal('staff')
  if (!VALID.includes(status as StockStatus)) return { error: 'Invalid stock status.' }
  const p = await db.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!p) return { error: 'Product not found.' }
  await db.product.update({ where: { id: productId }, data: { stockStatus: status as StockStatus } })
  revalidatePath('/staff/stock')
  return { ok: true }
}

/** Set the on-hand quantity for a product. */
export async function setStockQty(productId: string, qty: number): Promise<{ ok?: boolean; error?: string }> {
  await requirePortal('staff')
  const n = Math.max(0, Math.floor(Number(qty) || 0))
  const p = await db.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!p) return { error: 'Product not found.' }
  await db.product.update({ where: { id: productId }, data: { stockQty: n } })
  revalidatePath('/staff/stock')
  return { ok: true }
}

/** Set the same stock status on many products at once. */
export async function bulkSetStockStatus(ids: string[], status: string): Promise<{ ok?: boolean; count?: number; error?: string }> {
  await requirePortal('staff')
  if (!VALID.includes(status as StockStatus)) return { error: 'Invalid stock status.' }
  const clean = ids.filter((id) => typeof id === 'string' && id).slice(0, 500)
  if (clean.length === 0) return { error: 'No products selected.' }
  const res = await db.product.updateMany({ where: { id: { in: clean } }, data: { stockStatus: status as StockStatus } })
  revalidatePath('/staff/stock')
  return { ok: true, count: res.count }
}
