import { db } from '@/lib/db'
import { INDUSTRIES } from '@/lib/taxonomy'

/** Live catalog size — number of active products. */
export async function getInstrumentCount(): Promise<number> {
  return db.product.count({ where: { active: true } })
}

/** Live headline counts for the marketing copy (so they never go stale). */
export async function getCatalogCounts(): Promise<{ instruments: number; brands: number; industries: number }> {
  const [instruments, brands] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.brand.count({ where: { products: { some: { active: true } } } }),
  ])
  return { instruments, brands, industries: INDUSTRIES.length }
}
