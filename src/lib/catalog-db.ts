import 'server-only'
import { db } from '@/lib/db'
import { productImageUrl } from '@/lib/product-image'
import type { ProductType } from '@/generated/prisma/client'

/** The three catalog sections, mapped to the underlying Product.type. */
export type Section = 'instruments' | 'consumables' | 'spare-parts'

const SECTION_TYPE: Record<Section, ProductType> = {
  instruments: 'EQUIPMENT',
  consumables: 'CONSUMABLE',
  'spare-parts': 'SPARE_PART',
}

export function isSection(value: string): value is Section {
  return value === 'instruments' || value === 'consumables' || value === 'spare-parts'
}

export const SECTION_META: Record<
  Section,
  { eyebrow: string; title: string; intro: string; countLabel: string }
> = {
  instruments: {
    eyebrow: 'Instruments',
    title: 'Analytical instruments & equipment',
    intro:
      'XRF, flash point, distillation, mercury, NMR, FTIR, viscosity and more — supplied, installed and serviced in-region. Filter by brand and industry, then request a quote.',
    countLabel: 'instruments',
  },
  consumables: {
    eyebrow: 'Consumables',
    title: 'Lab consumables & reference materials',
    intro:
      'Standards, reagents, cells and everyday consumables to keep your methods running. Priced items show list price; the rest are a quick request away.',
    countLabel: 'consumables',
  },
  'spare-parts': {
    eyebrow: 'Spare parts',
    title: 'OEM spare parts',
    intro:
      'Genuine spare parts held in regional stock — no six-week waits. Search by brand or model; request a price where it isn’t listed.',
    countLabel: 'spare parts',
  },
}

export type CtaKind = 'CART' | 'QUOTE'

/** A flattened, serializable product shape for the section pages. */
export type SectionProduct = {
  id: string
  slug: string
  name: string
  brand: string
  brandSlug: string
  image: string | null
  desc: string
  industries: string[]
  standards: string[]
  tags: string[]
  listPrice: number | null
  currency: string
  priceMode: 'LISTED' | 'INDICATIVE' | 'ON_REQUEST'
  priceUpdatedAt: Date | null
  type: ProductType
  saleMode: 'CART_ENABLED' | 'QUOTE_ONLY'
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER'
  featured: boolean
  isNew: boolean
}

export type SectionFilters = {
  q?: string
  brand?: string
  industry?: string
  tag?: string
}

/**
 * Effective commerce CTA for a product. 'CART' only when the product is
 * cart-enabled, priced and in stock; otherwise it's a quote/enquiry.
 * (The cart itself is a later phase — this only drives labels + price display.)
 */
export function ctaFor(p: Pick<SectionProduct, 'saleMode' | 'listPrice' | 'stockStatus'>): CtaKind {
  if (p.saleMode === 'CART_ENABLED' && p.listPrice != null && p.stockStatus !== 'OUT_OF_STOCK') {
    return 'CART'
  }
  return 'QUOTE'
}

/** Re-export so pages can build <img src> from a bare filename or an uploaded URL. */
export { productImageUrl }

/**
 * Active products of a section's type, ordered featured-first then name,
 * then filtered in-memory by the (optional) q / brand / industry facets.
 */
export async function getSectionProducts(
  section: Section,
  filters: SectionFilters = {},
): Promise<SectionProduct[]> {
  const rows = await db.product.findMany({
    where: { active: true, type: SECTION_TYPE[section] },
    // Recent-first when browsing a tag (e.g. #new-arrival); otherwise featured-first.
    orderBy: filters.tag
      ? [{ createdAt: 'desc' }]
      : [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      image: true,
      desc: true,
      industries: true,
      standards: true,
      tags: true,
      listPrice: true,
      currency: true,
      priceMode: true,
      priceUpdatedAt: true,
      type: true,
      saleMode: true,
      stockStatus: true,
      featured: true,
      newUntil: true,
      brand: { select: { name: true, slug: true } },
    },
  })

  const now = new Date()
  const products: SectionProduct[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand.name,
    brandSlug: r.brand.slug,
    image: r.image,
    desc: r.desc,
    industries: r.industries,
    standards: r.standards,
    tags: r.tags,
    listPrice: r.listPrice == null ? null : Number(r.listPrice),
    currency: r.currency,
    priceMode: r.priceMode,
    priceUpdatedAt: r.priceUpdatedAt,
    type: r.type,
    saleMode: r.saleMode,
    stockStatus: r.stockStatus,
    featured: r.featured,
    isNew: r.newUntil != null && r.newUntil > now,
  }))

  // A #hashtag typed into search is treated as a tag filter.
  const rawQ = filters.q?.trim() ?? ''
  const qTag = rawQ.startsWith('#') ? rawQ.slice(1).toLowerCase().replace(/\s+/g, '-') : null
  const q = rawQ.toLowerCase()
  const tag = filters.tag?.toLowerCase()

  const filtered = products.filter((p) => {
    if (filters.brand && p.brandSlug !== filters.brand) return false
    if (filters.industry && !p.industries.includes(filters.industry)) return false
    if (tag && !p.tags.includes(tag)) return false
    if (qTag) {
      if (!p.tags.includes(qTag)) return false
    } else if (q) {
      // Tags act as a hidden search index alongside name/brand/desc/standards.
      const hay = `${p.name} ${p.brand} ${p.desc} ${p.standards.join(' ')} ${p.tags.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // New arrivals surface first (isNew auto-expires when newUntil passes),
  // keeping the underlying featured/name order within each group (stable sort).
  return filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew))
}

export type Facet = { value: string; label: string; count: number }

export type SectionFacets = {
  brands: Facet[]
  industries: Facet[]
}

/** Distinct brands (with counts) and industries for a section, for the filter rail. */
export async function getSectionFacets(section: Section): Promise<SectionFacets> {
  const rows = await db.product.findMany({
    where: { active: true, type: SECTION_TYPE[section] },
    select: {
      industries: true,
      brand: { select: { name: true, slug: true } },
    },
  })

  const brandMap = new Map<string, Facet>()
  const industryMap = new Map<string, Facet>()

  for (const r of rows) {
    const b = brandMap.get(r.brand.slug)
    if (b) b.count += 1
    else brandMap.set(r.brand.slug, { value: r.brand.slug, label: r.brand.name, count: 1 })

    for (const ind of r.industries) {
      const i = industryMap.get(ind)
      if (i) i.count += 1
      else industryMap.set(ind, { value: ind, label: humanizeIndustry(ind), count: 1 })
    }
  }

  const brands = [...brandMap.values()].sort((a, b) => a.label.localeCompare(b.label))
  const industries = [...industryMap.values()].sort((a, b) => a.label.localeCompare(b.label))
  return { brands, industries }
}

/** Turn an industry slug/id like "oil-gas" into a readable "Oil Gas". */
function humanizeIndustry(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Public helper so pages can humanize industry ids consistently. */
export { humanizeIndustry }

// ---------------------------------------------------------------------------
// Product detail (PDP) — one product plus its BOM relations and related items
// ---------------------------------------------------------------------------

/** A compatible spare/consumable listed under an equipment product's BOM. */
export type CompatibleSpare = {
  slug: string
  name: string
  brand: string
  image: string | null
  requirement: 'REQUIRED' | 'OPTIONAL'
  defaultQty: number
  bundledFree: boolean
  listPrice: number | null
  currency: string
}

/** An equipment product that this spare part fits / is used in. */
export type UsedInEquipment = {
  slug: string
  name: string
  brand: string
  image: string | null
}

/** A trimmed related-product card shape (reuses the section card layout). */
export type RelatedProduct = {
  slug: string
  name: string
  brand: string
  image: string | null
  desc: string
  type: ProductType
}

/** The full, flattened, serializable product-detail payload for the PDP. */
export type ProductDetail = {
  id: string
  slug: string
  name: string
  type: ProductType
  desc: string
  overview: string | null
  image: string | null
  images: string[]
  brand: string
  brandSlug: string
  brandLogo: string | null
  brandCountry: string | null
  industries: string[]
  standards: string[]
  productType: string | null
  sample: string | null
  output: string | null
  partnerStatus: string | null
  warranty: string | null
  service: string | null
  datasheetUrl: string | null
  listPrice: number | null
  currency: string
  priceMode: 'LISTED' | 'INDICATIVE' | 'ON_REQUEST'
  priceUpdatedAt: Date | null
  saleMode: 'CART_ENABLED' | 'QUOTE_ONLY'
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER'
  featured: boolean
  compatibleSpares: CompatibleSpare[]
  usedInEquipment: UsedInEquipment[]
  related: RelatedProduct[]
}

/**
 * Load a single active product by slug plus its BOM relations and up to 4
 * related products. Returns null when there is no active product for the slug.
 */
export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const p = await db.product.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      desc: true,
      overview: true,
      image: true,
      images: true,
      industries: true,
      standards: true,
      productType: true,
      sample: true,
      output: true,
      partnerStatus: true,
      warranty: true,
      service: true,
      datasheetUrl: true,
      listPrice: true,
      currency: true,
      priceMode: true,
      priceUpdatedAt: true,
      saleMode: true,
      stockStatus: true,
      featured: true,
      brand: { select: { name: true, slug: true, logo: true, countryOfOrigin: true } },
      // BOM: spares of THIS equipment
      sparesForThis: {
        select: {
          requirement: true,
          defaultQty: true,
          bundledFree: true,
          sparePart: {
            select: {
              slug: true,
              name: true,
              image: true,
              listPrice: true,
              currency: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
      // reverse BOM: equipment THIS spare belongs to
      usedInEquipment: {
        select: {
          equipment: {
            select: {
              slug: true,
              name: true,
              image: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
    },
  })

  if (!p) return null

  const requirementRank = (r: 'REQUIRED' | 'OPTIONAL') => (r === 'REQUIRED' ? 0 : 1)

  const compatibleSpares: CompatibleSpare[] = p.sparesForThis
    .map((es) => ({
      slug: es.sparePart.slug,
      name: es.sparePart.name,
      brand: es.sparePart.brand.name,
      image: es.sparePart.image,
      requirement: es.requirement,
      defaultQty: es.defaultQty,
      bundledFree: es.bundledFree,
      listPrice: es.sparePart.listPrice == null ? null : Number(es.sparePart.listPrice),
      currency: es.sparePart.currency,
    }))
    // REQUIRED first, then alphabetical by name.
    .sort(
      (a, b) => requirementRank(a.requirement) - requirementRank(b.requirement) || a.name.localeCompare(b.name),
    )

  const usedInEquipment: UsedInEquipment[] = p.usedInEquipment
    .map((es) => ({
      slug: es.equipment.slug,
      name: es.equipment.name,
      brand: es.equipment.brand.name,
      image: es.equipment.image,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Up to 4 other active products sharing the same brand or an industry.
  const relatedRows = await db.product.findMany({
    where: {
      active: true,
      slug: { not: p.slug },
      OR: [{ brand: { slug: p.brand.slug } }, { industries: { hasSome: p.industries } }],
    },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    take: 4,
    select: {
      slug: true,
      name: true,
      image: true,
      desc: true,
      type: true,
      brand: { select: { name: true } },
    },
  })

  const related: RelatedProduct[] = relatedRows.map((r) => ({
    slug: r.slug,
    name: r.name,
    brand: r.brand.name,
    image: r.image,
    desc: r.desc,
    type: r.type,
  }))

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    desc: p.desc,
    overview: p.overview,
    image: p.image,
    images: p.images,
    brand: p.brand.name,
    brandSlug: p.brand.slug,
    brandLogo: p.brand.logo,
    brandCountry: p.brand.countryOfOrigin,
    industries: p.industries,
    standards: p.standards,
    productType: p.productType,
    sample: p.sample,
    output: p.output,
    partnerStatus: p.partnerStatus,
    warranty: p.warranty,
    service: p.service,
    datasheetUrl: p.datasheetUrl,
    listPrice: p.listPrice == null ? null : Number(p.listPrice),
    currency: p.currency,
    priceMode: p.priceMode,
    priceUpdatedAt: p.priceUpdatedAt,
    saleMode: p.saleMode,
    stockStatus: p.stockStatus,
    featured: p.featured,
    compatibleSpares,
    usedInEquipment,
    related,
  }
}
