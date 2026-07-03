import fs from 'node:fs'
import path from 'node:path'

// Interim data source: data/catalog.json (imported from chemparts-me.com).
// Part B of Phase 2 switches these functions to Prisma queries after
// scripts/import-catalog.ts loads the same JSON into the database.

export type CatalogProduct = {
  slug: string
  name: string
  brand: string
  type: 'EQUIPMENT' | 'SPARE_PART' | 'CONSUMABLE'
  featured: boolean
  image: string | null
  images: string[]
  desc: string
  industries: string[]
  testTypes: string[]
  specs: Record<string, string>
  standards: string[]
  overview: string
}

let cache: CatalogProduct[] | null = null

function load(): CatalogProduct[] {
  if (!cache) {
    const file = path.join(process.cwd(), 'data', 'catalog.json')
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as CatalogProduct[]
  }
  return cache
}

export type ProductFilter = {
  q?: string
  brand?: string
  industry?: string
}

export function getProducts({ q, brand, industry }: ProductFilter): CatalogProduct[] {
  let items = load()
  if (brand) items = items.filter((p) => p.brand === brand)
  if (industry) items = items.filter((p) => p.industries.includes(industry))
  if (q) {
    const needle = q.toLowerCase()
    items = items.filter((p) =>
      [p.name, p.brand, p.desc, ...p.standards, ...p.testTypes]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }
  return items
}

export function getProduct(slug: string): CatalogProduct | null {
  return load().find((p) => p.slug === slug) ?? null
}

export function getBrands(): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of load()) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1)
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getIndustries(): string[] {
  return [...new Set(load().flatMap((p) => p.industries))].sort()
}
