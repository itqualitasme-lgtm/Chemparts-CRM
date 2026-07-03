// Pure, DB-free catalog filtering — unit-testable in isolation.

export type ProductType = 'EQUIPMENT' | 'SPARE_PART' | 'CONSUMABLE'

export type CatalogProduct = {
  slug: string
  name: string
  brand: string
  type: ProductType
  featured: boolean
  image: string | null
  images: string[]
  desc: string
  industries: string[]
  testTypes: string[]
  specs: Record<string, string>
  standards: string[]
  overview: string
  listPrice: number | null
  currency: string
}

export type ProductFilter = {
  q?: string
  brand?: string
  industry?: string
  type?: ProductType
}

export function filterProducts(items: CatalogProduct[], { q, brand, industry, type }: ProductFilter): CatalogProduct[] {
  let out = items
  if (type) out = out.filter((p) => p.type === type)
  if (brand) out = out.filter((p) => p.brand === brand)
  if (industry) out = out.filter((p) => p.industries.includes(industry))
  if (q) {
    const needle = q.toLowerCase()
    out = out.filter((p) =>
      [p.name, p.brand, p.desc, ...p.standards, ...p.testTypes]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }
  return out
}
