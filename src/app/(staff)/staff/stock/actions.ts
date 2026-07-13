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
