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

export type QuoteLine = { qty: number; unitPrice: number }

/** Subtotal, VAT and grand total for a set of quotation lines. */
export function quoteTotals(items: QuoteLine[], vatPercent: number) {
  const subtotal = items.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
  const vat = subtotal * (vatPercent / 100)
  return { subtotal, vat, total: subtotal + vat }
}
