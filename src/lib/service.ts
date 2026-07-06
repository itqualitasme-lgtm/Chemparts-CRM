import 'server-only'
import { db } from '@/lib/db'

/** Generate SRV-YYYY-NNNN from the count of this year's service requests. */
export async function nextServiceNo(): Promise<string> {
  const year = new Date().getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  const count = await db.serviceRequest.count({ where: { createdAt: { gte: start, lt: end } } })
  return `SRV-${year}-${String(count + 1).padStart(4, '0')}`
}

export const SERVICE_TYPES = [
  ['AMC', 'Annual Maintenance Contract (AMC)'],
  ['CALIBRATION', 'Calibration'],
  ['REPAIR', 'Repair'],
  ['INSTALLATION', 'Installation / commissioning'],
  ['CONSULTATION', 'Consultation / planning'],
  ['OTHER', 'Other'],
] as const

export const SERVICE_TYPE_LABEL: Record<string, string> = Object.fromEntries(SERVICE_TYPES)
