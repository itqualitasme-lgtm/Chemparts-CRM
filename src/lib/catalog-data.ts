import 'server-only'
import { db } from '@/lib/db'

// The public catalog (products.js) is DB-driven: instead of the frozen static
// public/assets/js/products.js, we read the live Product/Brand tables and inject
// the same window.PRODUCTS / window.BRANDS / window.INDUSTRIES / window.TEST_TYPES
// shape the site's client scripts (products-page.js, product-detail.js) expect.
// This is why staff edits/deletes/logo uploads now reflect on the website.

export type CatalogProduct = {
  slug: string
  name: string
  brand: string
  featured?: boolean
  image: string | null
  images: string[]
  desc: string
  industries: string[]
  testTypes: string[]
  specs: Record<string, string>
  standards: string[]
  overview: string
  docs: { title: string; href: string }[]
}

export type CatalogData = {
  products: CatalogProduct[]
  brands: string[]
  industries: { id: string; label: string }[]
  testTypes: { id: string; label: string }[]
}

// Taxonomy — stable id→label maps for the sidebar filters. Counts are derived
// client-side from the products list, so brands/industries with no live product
// simply show a zero (or, for brands, are omitted below).
const INDUSTRIES: { id: string; label: string }[] = [
  { id: 'petroleum', label: 'Petroleum' },
  { id: 'refineries', label: 'Refineries' },
  { id: 'plastics', label: 'Plastics' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'food', label: 'Food & Water' },
  { id: 'materials', label: 'Materials' },
]

const TEST_TYPE_LABELS: Record<string, string> = {
  analytical: 'General Analytical', 'aniline-point': 'Aniline Point', antioxidant: 'Antioxidant',
  'carbon-residue': 'Carbon Residue', chlorine: 'Chlorine', 'cloud-point': 'Cloud Point',
  coating: 'Coating Thickness', conductivity: 'Conductivity', corrosion: 'Corrosion',
  distillation: 'Distillation', elemental: 'Elemental', evaporation: 'Evaporation',
  'fire-point': 'Fire Point', 'flash-point': 'Flash Point', foaming: 'Foaming',
  'freezing-point': 'Freezing Point', ftir: 'FTIR', 'gas-chromatography': 'Gas Chromatography',
  halogen: 'Halogen', mercury: 'Mercury', moisture: 'Moisture', multi: 'Multi-Parameter',
  nitrogen: 'Nitrogen', nmr: 'NMR', 'oil-condition': 'Oil Condition', oxidation: 'Oxidation',
  ph: 'pH', 'pour-point': 'Pour Point', spectroscopy: 'Spectroscopy', sulphur: 'Sulphur',
  'uv-vis': 'UV-Vis', 'vapor-pressure': 'Vapor Pressure', varnish: 'Varnish',
  viscosity: 'Viscosity', wear: 'Wear', weighing: 'Weighing', xrf: 'XRF',
}

function titleCase(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Live public catalog, shaped for the ported site's client scripts. */
export async function getPublicCatalog(): Promise<CatalogData> {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      slug: true, name: true, featured: true, image: true, images: true,
      desc: true, overview: true, industries: true, testTypes: true, standards: true,
      specs: true, productType: true, sample: true, output: true, datasheetUrl: true,
      brand: { select: { name: true } },
    },
  })

  const products: CatalogProduct[] = rows.map((p) => {
    // Rebuild the specs object the PDP renders (type/sample/standards/output),
    // then merge any extra rows stored in the Json `specs` column.
    const baseSpecs: Record<string, string> = {}
    if (p.productType) baseSpecs.type = p.productType
    if (p.sample) baseSpecs.sample = p.sample
    if (p.standards.length) baseSpecs.standards = p.standards.join(', ')
    if (p.output) baseSpecs.output = p.output
    const extra = (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs))
      ? (p.specs as Record<string, string>)
      : {}
    const docs = p.datasheetUrl
      ? [{ title: 'Datasheet (PDF)', href: p.datasheetUrl }]
      : [{ title: 'Datasheet (PDF)', href: `mailto:info@chemparts-me.com?subject=Datasheet request — ${p.name}` }]

    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand.name,
      featured: p.featured || undefined,
      image: p.image,
      images: p.images.length ? p.images : p.image ? [p.image] : [],
      desc: p.desc,
      industries: p.industries,
      testTypes: p.testTypes,
      specs: { ...baseSpecs, ...extra },
      standards: p.standards,
      overview: p.overview || p.desc,
      docs,
    }
  })

  // Brands & test types that actually have live products (so deletes reflect).
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b))
  const usedTestTypes = new Set(products.flatMap((p) => p.testTypes))
  const testTypes = Array.from(usedTestTypes)
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, label: TEST_TYPE_LABELS[id] ?? titleCase(id) }))

  return { products, brands, industries: INDUSTRIES, testTypes }
}
