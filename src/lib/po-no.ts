import 'server-only'
import { db } from '@/lib/db'

/** Generate PO-YYYY-NNNN from the count of this year's purchase orders. */
export async function nextPoNo(): Promise<string> {
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const count = await db.purchaseOrder.count({ where: { createdAt: { gte: start, lt: end } } })
  return `PO-${year}-${String(count + 1).padStart(4, '0')}`
}
