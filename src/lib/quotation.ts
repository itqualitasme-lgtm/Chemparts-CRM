import 'server-only'
import { db } from '@/lib/db'

/** Generate QUO-YYYY-NNNN from the count of this year's quotations. */
export async function nextQuotationNo(): Promise<string> {
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const count = await db.quotation.count({ where: { createdAt: { gte: start, lt: end } } })
  return `QUO-${year}-${String(count + 1).padStart(4, '0')}`
}

export type QuoteLine = { qty: number; unitPrice: number; discountPct?: number }

/** Net amount for a single line after its per-line discount. */
export function lineNet(l: QuoteLine): number {
  return l.qty * l.unitPrice * (1 - (l.discountPct ?? 0) / 100)
}

/**
 * Subtotal (after per-line discounts), plus additional charges (shipping/other),
 * VAT on the taxable amount, and grand total.
 */
export function quoteTotals(
  items: QuoteLine[],
  vatPercent: number,
  charges: { shipping?: number; other?: number } = {},
) {
  const subtotal = items.reduce((sum, l) => sum + lineNet(l), 0)
  const shipping = charges.shipping ?? 0
  const other = charges.other ?? 0
  const taxable = subtotal + shipping + other
  const vat = taxable * (vatPercent / 100)
  return { subtotal, shipping, other, vat, total: taxable + vat }
}
