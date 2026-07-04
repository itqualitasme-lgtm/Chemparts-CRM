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
  slug: string
  name: string
  brand: string
  brandSlug: string
  image: string | null
  desc: string
  industries: string[]
  standards: string[]
  listPrice: number | null
  currency: string
  type: ProductType
  saleMode: 'CART_ENABLED' | 'QUOTE_ONLY'
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER'
  featured: boolean
}

export type SectionFilters = {
  q?: string
  brand?: string
  industry?: string
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
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      slug: true,
      name: true,
      image: true,
      desc: true,
      industries: true,
      standards: true,
      listPrice: true,
      currency: true,
      type: true,
      saleMode: true,
      stockStatus: true,
      featured: true,
      brand: { select: { name: true, slug: true } },
    },
  })

  const products: SectionProduct[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    brand: r.brand.name,
    brandSlug: r.brand.slug,
    image: r.image,
    desc: r.desc,
    industries: r.industries,
    standards: r.standards,
    listPrice: r.listPrice == null ? null : Number(r.listPrice),
    currency: r.currency,
    type: r.type,
    saleMode: r.saleMode,
    stockStatus: r.stockStatus,
    featured: r.featured,
  }))

  const q = filters.q?.trim().toLowerCase()
  return products.filter((p) => {
    if (filters.brand && p.brandSlug !== filters.brand) return false
    if (filters.industry && !p.industries.includes(filters.industry)) return false
    if (q) {
      const hay = `${p.name} ${p.brand} ${p.desc} ${p.standards.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
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
