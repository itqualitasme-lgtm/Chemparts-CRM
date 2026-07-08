import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { categorizeProduct } from '../src/lib/categorize'

// Backfills Industry + Test-type taxonomy on every product that has none, using
// the shared heuristic in src/lib/categorize.ts. Idempotent: only fills empty
// fields so any manual staff tagging is preserved. Run with --apply to write.

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force') // re-derive even if already set
const db = new PrismaClient({ adapter: createPgAdapter() })

async function main() {
  const rows = await db.product.findMany({
    select: { id: true, name: true, desc: true, industries: true, testTypes: true, brand: { select: { name: true } }, category: { select: { name: true } } },
  })
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'}${FORCE ? ' (force)' : ''} — ${rows.length} products`)

  let updated = 0
  const sampleInd: Record<string, number> = {}
  const sampleTt: Record<string, number> = {}
  for (const p of rows) {
    const needInd = FORCE || p.industries.length === 0
    const needTt = FORCE || p.testTypes.length === 0
    if (!needInd && !needTt) continue
    const { industries, testTypes } = categorizeProduct({ brand: p.brand?.name, name: p.name, category: p.category?.name, desc: p.desc })
    const data: { industries?: string[]; testTypes?: string[] } = {}
    if (needInd) { data.industries = industries; industries.forEach((i) => (sampleInd[i] = (sampleInd[i] || 0) + 1)) }
    if (needTt) { data.testTypes = testTypes; testTypes.forEach((t) => (sampleTt[t] = (sampleTt[t] || 0) + 1)) }
    if (APPLY) await db.product.update({ where: { id: p.id }, data })
    updated++
  }
  console.log(`\nupdated ${updated} products`)
  console.log('industry counts:', JSON.stringify(sampleInd))
  console.log('test-type counts:', JSON.stringify(sampleTt))
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
