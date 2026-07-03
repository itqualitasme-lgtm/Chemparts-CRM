import { db } from '@/lib/db'

/** Live catalog size — number of active products. */
export async function getInstrumentCount(): Promise<number> {
  return db.product.count({ where: { active: true } })
}
