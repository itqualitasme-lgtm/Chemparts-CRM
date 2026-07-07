import 'server-only'
import { db } from '@/lib/db'
import { INDUSTRIES, TEST_TYPE_LABELS } from '@/lib/taxonomy'
import { absImg, optimizedImg } from '@/lib/img'

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
  thumb: string | null
  brandLogo: string | null
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

// Taxonomy (INDUSTRIES / TEST_TYPE_LABELS) is imported from '@/lib/taxonomy' so
// the product form and the public filters share one source of truth.

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
      brand: { select: { name: true, logo: true } },
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

    // Resolve bare filenames to correct absolute paths (fixes imported catalog
    // images). The card grid uses `thumb` (640); the product page uses `images`
    // optimized to 1080 (WebP/AVIF + CDN-cached) — far smaller than the raw
    // Supabase originals. `image` stays raw as an onerror fallback.
    const rawImages = (p.images.length ? p.images : p.image ? [p.image] : [])
      .map((im) => absImg(im))
      .filter((x): x is string => !!x)

    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand.name,
      featured: p.featured || undefined,
      image: absImg(p.image),
      thumb: optimizedImg(p.image, 640),
      brandLogo: p.brand.logo ? optimizedImg(p.brand.logo, 128) : null,
      images: rawImages.map((im) => optimizedImg(im, 1080) as string),
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
