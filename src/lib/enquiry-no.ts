import 'server-only'
import { db } from '@/lib/db'

/** Generate ENQ-YYYY-NNNN from the count of this year's enquiries. */
export async function nextEnquiryNo(): Promise<string> {
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const count = await db.enquiry.count({ where: { createdAt: { gte: start, lt: end } } })
  return `ENQ-${year}-${String(count + 1).padStart(4, '0')}`
}
