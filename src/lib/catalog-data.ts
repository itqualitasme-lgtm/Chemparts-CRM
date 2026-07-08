import 'server-only'
import { db } from '@/lib/db'
import { INDUSTRIES, TEST_TYPE_LABELS } from '@/lib/taxonomy'
import { absImg, optimizedImg } from '@/lib/img'

// The public catalog (products.js) is DB-driven: instead of the frozen static
// public/assets/js/products.js, we read the live Product/Brand tables and inject
// the same window.PRODUCTS / window.BRANDS / window.INDUSTRIES / window.TEST_TYPES
// shape the site's client scripts (products-page.js, product-detail.js) expect.
// This is why staff edits/deletes/logo uploads now reflect on the website.

// LEAN list shape injected into window.PRODUCTS on every page. Detail-only fields
// (images gallery, specs table, overview, docs) are NOT here — the product page
// fetches them on demand from /api/catalog/detail (see getCatalogDetail). Brand
// logos are deduped into window.BRAND_LOGOS (14 values, not one per product).
export type CatalogProduct = {
  slug: string
  name: string
  brand: string
  featured?: boolean
  image: string | null
  thumb: string | null
  desc: string
  industries: string[]
  testTypes: string[]
  standards: string[]
  category?: string
}

export type CatalogData = {
  products: CatalogProduct[]
  brands: string[]
  brandLogos: Record<string, string>
  industries: { id: string; label: string }[]
  testTypes: { id: string; label: string }[]
  categories: { id: string; label: string }[]
}

/** Heavy detail-only fields for one product, fetched on demand by the PDP. */
export type CatalogDetail = {
  images: string[]
  specs: Record<string, string>
  overview?: string
  docs?: { title: string; href: string }[]
}

// Taxonomy (INDUSTRIES / TEST_TYPE_LABELS) is imported from '@/lib/taxonomy' so
// the product form and the public filters share one source of truth.

function titleCase(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Rebuild the specs object the PDP renders (type/sample/standards/output). */
function buildSpecs(p: { productType?: string | null; sample?: string | null; output?: string | null; standards: string[]; specs: unknown }): Record<string, string> {
  const base: Record<string, string> = {}
  if (p.productType) base.type = p.productType
  if (p.sample) base.sample = p.sample
  if (p.standards.length) base.standards = p.standards.join(', ')
  if (p.output) base.output = p.output
  const extra = (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs))
    ? (p.specs as Record<string, string>)
    : {}
  return { ...base, ...extra }
}

/** Live public catalog (LEAN list), shaped for the ported site's client scripts. */
export async function getPublicCatalog(): Promise<CatalogData> {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      slug: true, name: true, featured: true, image: true,
      desc: true, industries: true, testTypes: true, standards: true,
      brand: { select: { name: true } },
      category: { select: { slug: true, name: true } },
    },
  })

  const products: CatalogProduct[] = rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    featured: p.featured || undefined,
    image: absImg(p.image),
    thumb: optimizedImg(p.image, 640),
    desc: p.desc,
    industries: p.industries,
    testTypes: p.testTypes,
    standards: p.standards,
    ...(p.category ? { category: p.category.slug } : {}),
  }))

  // Categories that have live products, with labels, sorted by product count
  // (most-populated first) so the useful families head the filter list.
  const catCount = new Map<string, { label: string; n: number }>()
  for (const p of rows) {
    if (!p.category) continue
    const cur = catCount.get(p.category.slug) || { label: p.category.name, n: 0 }
    cur.n++
    catCount.set(p.category.slug, cur)
  }
  const categories = [...catCount.entries()]
    .sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label))
    .map(([id, v]) => ({ id, label: v.label }))

  // Brands that actually have live products (so deletes reflect), ordered
  // featured/partner brands first (then by sortOrder, then alphabetically) so the
  // authorized partners head the website's Brand filter. Logos are deduped here.
  const liveBrandNames = new Set(products.map((p) => p.brand))
  const brandMeta = await db.brand.findMany({
    where: { name: { in: [...liveBrandNames] } },
    select: { name: true, featured: true, sortOrder: true, logo: true },
  })
  const rank = new Map(brandMeta.map((b) => [b.name, b]))
  const brands = [...liveBrandNames].sort((a, b) => {
    const ma = rank.get(a), mb = rank.get(b)
    return Number(mb?.featured ?? false) - Number(ma?.featured ?? false)
      || (ma?.sortOrder ?? 0) - (mb?.sortOrder ?? 0)
      || a.localeCompare(b)
  })
  const brandLogos: Record<string, string> = {}
  for (const b of brandMeta) if (b.logo) brandLogos[b.name] = optimizedImg(b.logo, 128) as string

  const usedTestTypes = new Set(products.flatMap((p) => p.testTypes))
  const testTypes = Array.from(usedTestTypes)
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, label: TEST_TYPE_LABELS[id] ?? titleCase(id) }))

  return { products, brands, brandLogos, industries: INDUSTRIES, testTypes, categories }
}

/**
 * Heavy detail-only fields for one product (gallery images, spec table,
 * overview, docs). Served by /api/catalog/detail and merged into the lean
 * product on the client when the product page renders.
 */
export async function getCatalogDetail(slug: string): Promise<CatalogDetail | null> {
  const p = await db.product.findFirst({
    where: { slug, active: true },
    select: {
      image: true, images: true, desc: true, overview: true,
      standards: true, specs: true, productType: true, sample: true, output: true, datasheetUrl: true,
    },
  })
  if (!p) return null

  const rawImages = (p.images.length ? p.images : p.image ? [p.image] : [])
    .map((im) => absImg(im))
    .filter((x): x is string => !!x)

  return {
    images: rawImages.map((im) => optimizedImg(im, 1080) as string),
    specs: buildSpecs(p),
    ...(p.overview && p.overview !== p.desc ? { overview: p.overview } : {}),
    ...(p.datasheetUrl ? { docs: [{ title: 'Datasheet (PDF)', href: p.datasheetUrl }] } : {}),
  }
}
