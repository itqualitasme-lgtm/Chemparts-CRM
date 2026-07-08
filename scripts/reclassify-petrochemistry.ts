import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'

// Splits the large "Petrochemistry (General)" bucket (Biolab's own grab-bag
// category) into the canonical instrument families by matching each product's
// name/description. Anything that doesn't clearly match stays in Petrochemistry.
// Idempotent; --apply to write.

const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })

// [canonical slug, matcher] — evaluated in order, first match wins.
const RULES: [string, RegExp][] = [
  ['flash-fire-point', /flash[\s-]?point|pensky|cleveland|\btag\b|miniflash|abel|fire[\s-]?point|open cup|closed cup/i],
  ['vapour-pressure', /vapou?r pressure|\brvp\b|reid|minivap|vpxpert|vp vision/i],
  ['distillation-volatility', /distillation|dean.{0,4}stark|\bd86\b|d2892|d1160|d5236|potstill|thin film|short-?path|evaporator|evaporation|\bnoack\b|\bvapol\b|solvent recycl/i],
  ['cold-flow-properties', /cloud point|pour point|freezing point|\bcfpp\b|cold filter|filter plugging|filterability|\bltft\b|low temperature flow|filter plugging tendency|low temperature torque/i],
  ['corrosion', /corrosion|rust prevention|\brust\b|copper corrosion|humidity cabinet/i],
  ['foaming-demulsibility', /foaming|foamer|demulsib|demulsiv|air release/i],
  ['oxidation-stability', /oxidation/i],
  ['viscosity', /viscomet|viscosity|saybolt|viscol/i],
  ['titration', /karl fischer|titrat|total acid|total base|\btan\b|\btbn\b/i],
  ['oil-condition-monitoring', /oil analyzer|oil lab|minilab|microlab|fieldlab|spectroil|miniscan|infracal|fuel analyzer|on-site oil|on-line oil|\bporla\b|bocle|lubricity|dropping point of lubricating/i],
  ['optical-emission-spectrometers', /rde-?oes|\brde\b/i],
  ['xrf-analyzers', /edxrf|mwdxrf|\bxrf\b|sindie|petramax|\bpetra\b|sulfur analy|sulphur analy|heavy metal|elemental analy|jp500|jpx500|e-max|phosphorus|phoebe|silicon detection|light elements/i],
  ['cleanliness-sediment', /sediment|particulate|contamination|centrifuge|\bfido\b/i],
  ['furnaces-ovens', /ash furnace|muffle|\bfurnace\b|ageing bath|aging bath/i],
  ['bitumen-wax-grease', /melting point|softening|ring and ball|solidification|\bgrease\b|\bwax\b|asphalt|penetration|loss on heating|rolling thin film/i],
  ['density', /densit|densimet|\bapi gravity\b/i],
  ['fuels-lubricants-coolants', /cetane|\biqt\b|aniline|carbon residue|ramsbottom|conradson|\bfia\b|fluorescent indicator|biodiesel|ethanol in gasoline|\blead\b|salt content|hydrogen sulfide|\bh2s\b|solvent in wax|solidification point/i],
  ['sample-preparation', /extractor|mixer-settler|distillation system|recycl/i],
  ['water-environmental', /chlorine|\bclora\b/i],
]

function classify(text: string): string | null {
  for (const [slug, re] of RULES) if (re.test(text)) return slug
  return null
}

async function main() {
  const petro = await db.category.findFirst({ where: { slug: 'petrochemistry' }, select: { id: true } })
  if (!petro) throw new Error('petrochemistry category missing')
  const cats = await db.category.findMany({ select: { id: true, slug: true } })
  const idBySlug = new Map(cats.map((c) => [c.slug, c.id]))

  const ps = await db.product.findMany({ where: { categoryId: petro.id, active: true }, select: { id: true, name: true, desc: true } })
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${ps.length} products in Petrochemistry`)

  const counts: Record<string, number> = {}
  const leftover: string[] = []
  for (const p of ps) {
    const target = classify(`${p.name} ${p.desc || ''}`)
    if (!target || target === 'petrochemistry') { leftover.push(p.name); continue }
    const cid = idBySlug.get(target)
    if (!cid) { console.log('  missing target category:', target); continue }
    counts[target] = (counts[target] || 0) + 1
    if (APPLY) await db.product.update({ where: { id: p.id }, data: { categoryId: cid } })
  }

  console.log('\nreassignments:')
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`))
  console.log(`\nstaying in Petrochemistry (General): ${leftover.length}`)
  leftover.forEach((n) => console.log('   ·', n.slice(0, 60)))
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
