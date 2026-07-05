import 'server-only'
import { db } from '@/lib/db'

export type SalesOption = { id: string; name: string }

/** Active sales people for assignment dropdowns. */
export async function getActiveSalesPeople(): Promise<SalesOption[]> {
  return db.salesPerson.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}
