import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'

// One-off: consolidate the 96 brand-specific categories (imported from each
// supplier's own taxonomy, with many near-duplicates) into a clean canonical
// set. Reassigns every product to its canonical category, then deletes the now
// -empty source categories. Idempotent — safe to re-run. Use --apply to write.

const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })

// canonicalSlug -> { name, members: [source slugs, incl. the canonical itself] }
const CANON: Record<string, { name: string; members: string[] }> = {
  'flash-fire-point': { name: 'Flash & Fire Point', members: ['flash-point', 'flammability'] },
  'viscosity': { name: 'Viscosity', members: ['viscosity', 'viscosity-baths'] },
  'distillation-volatility': { name: 'Distillation & Volatility', members: ['distillation', 'volatility'] },
  'vapour-pressure': { name: 'Vapour Pressure', members: ['vapour-pressure', 'vapor-pressure'] },
  'cold-flow-properties': { name: 'Cold Flow Properties', members: ['cold-flow-properties', 'cold-properties', 'cold-filter-plugging-point', 'cloud-point', 'pour-cloud-point'] },
  'corrosion': { name: 'Corrosion', members: ['corrosion-testing'] },
  'oxidation-stability': { name: 'Oxidation Stability', members: ['oxidation-stability'] },
  'foaming-demulsibility': { name: 'Foaming & Demulsibility', members: ['foaming', 'foaming-characteristics', 'demulsivity-and-foaming', 'demulsibility'] },
  'bitumen-wax-grease': { name: 'Bitumen, Wax & Grease', members: ['bitumen', 'bitumen-wax-grease', 'bitumen-testing', 'grease', 'softening-point'] },
  'density': { name: 'Density', members: ['density-testing'] },
  'cleanliness-sediment': { name: 'Cleanliness, Sediment & Water', members: ['cleanliness', 'sediment-testing', 'sediment-water', 'filtration', 'centrifuge-equipment'] },
  'fuels-lubricants-coolants': { name: 'Fuels, Lubricants & Coolants', members: ['fuels-lubricants-and-engine-coolants', 'lubricants', 'biodiesel-testing', 'lpg-testing', 'fuel-blending', 'evaporation-loss', 'aniline-point', 'carbon-residue'] },
  'gas-chromatography': { name: 'Gas Chromatography', members: ['gas-chromatography', 'gas-chromatographs'] },
  'sample-preparation': { name: 'Sample Preparation', members: ['sample-preparation'] },
  'calibration-standards': { name: 'Calibration & Standards', members: ['calibration-verification'] },
  'glassware-consumables': { name: 'Glassware & Consumables', members: ['glassware', 'consumables', 'spectroscopy-accessories-consumables', 'laboratory-furniture'] },
  'oil-condition-monitoring': { name: 'Oil Condition Monitoring', members: ['oil-condition-monitoring', 'used-oil-predictive', 'tribology', 'on-line-analyzers', 'oil-treatment-purification'] },
  'xrf-analyzers': { name: 'XRF Analyzers', members: ['benchtop-xrf-analyzers', 'handheld-xrf-libs-analyzers', 'coatings-thickness-analyzers'] },
  'optical-emission-spectrometers': { name: 'Optical Emission Spectrometers', members: ['optical-emission-spectrometers'] },
  'atomic-absorption-mercury': { name: 'Atomic Absorption & Mercury', members: ['atomic-absorption-mercury-analysis', 'atomic-absorption-spectrometers', 'icp-oes-spectrometers', 'industrial-mercury-monitoring', 'flame-photometers'] },
  'uv-vis-spectrophotometers': { name: 'UV-Vis Spectrophotometers', members: ['uv-vis-spectrophotometers', 'visible-spectrophotometers', 'touch-screen-spectrophotometers', 'xenon-spectrophotometers'] },
  'ftnir-ir-spectroscopy': { name: 'FT-NIR & IR Spectroscopy', members: ['ft-nir-analyzers', 'ir-spectrometry', 'ftir-spectrometers'] },
  'nmr-spectrometers': { name: 'NMR Spectrometers', members: ['td-nmr-analyzers', 'benchtop-nmr-spectrometers'] },
  'electrochemistry-meters': { name: 'Electrochemistry Meters', members: ['ph-meters', 'conductivity-meters', 'dissolved-oxygen-meters', 'ise-meters', 'multi-parameter-meters'] },
  'water-environmental': { name: 'Water & Environmental Analysis', members: ['water-flow-analyzers', 'turbidity-meters', 'colorimeters', 'environment-chemistry'] },
  'furnaces-ovens': { name: 'Furnaces & Ovens', members: ['muffle-ashing-furnaces', 'tube-furnaces', 'high-temperature-furnaces', 'ovens-forced-convection', 'special-application-furnaces', 'furnaces-up-to-1400-c'] },
  'thermal-analysis': { name: 'Thermal Analysis', members: ['thermal-analyzers'] },
  'balances-weighing': { name: 'Balances & Weighing', members: ['balances'] },
  'titration': { name: 'Titration & Karl Fischer', members: ['titration-systems'] },
  'lab-accessories': { name: 'Lab Instruments & Accessories', members: ['stirrers', 'digital-contact-thermometers', 'dissolution-testers'] },
  'bioanalysis': { name: 'Bioanalysis (PCR & CE)', members: ['pcr-analysis', 'capillary-electrophoresis'] },
  'luminescence': { name: 'Luminescence Analyzers', members: ['luminescence-analyzers'] },
  'petrochemistry': { name: 'Petrochemistry (General)', members: ['petrochemistry', 'petroleum-analysers', 'process-analyzers'] },
}

async function main() {
  const canonSlugs = Object.keys(CANON)
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${canonSlugs.length} canonical categories`)

  const all = await db.category.findMany({ select: { id: true, slug: true } })
  const byslug = new Map(all.map((c) => [c.slug, c.id]))
  // Sanity: every source slug should exist.
  const missing = Object.values(CANON).flatMap((c) => c.members).filter((s) => !byslug.has(s))
  if (missing.length) console.log('WARNING — member slugs not found in DB:', missing.join(', '))
  const mappedSources = new Set(Object.values(CANON).flatMap((c) => c.members))
  const unmapped = all.filter((c) => !mappedSources.has(c.slug)).map((c) => c.slug)
  if (unmapped.length) console.log('NOTE — categories not in any mapping (left as-is):', unmapped.join(', '))

  let sort = 10, moved = 0, deleted = 0
  for (const [slug, { name, members }] of Object.entries(CANON)) {
    let canonId = byslug.get(slug)
    if (APPLY) {
      const rec = await db.category.upsert({
        where: { slug },
        create: { slug, name, type: 'EQUIPMENT', sortOrder: sort },
        update: { name, sortOrder: sort },
        select: { id: true },
      })
      canonId = rec.id
    }
    sort += 10
    for (const m of members) {
      if (m === slug) continue
      const mid = byslug.get(m)
      if (!mid) continue
      if (APPLY && canonId) {
        const res = await db.product.updateMany({ where: { categoryId: mid }, data: { categoryId: canonId } })
        moved += res.count
        await db.category.delete({ where: { id: mid } })
        deleted++
      }
    }
  }
  console.log(`\nmoved ${moved} product reassignments | deleted ${deleted} redundant categories`)
  if (APPLY) {
    const remaining = await db.category.count()
    const withProducts = await db.category.count({ where: { products: { some: { active: true } } } })
    console.log(`categories now: ${remaining} (${withProducts} with active products)`)
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
