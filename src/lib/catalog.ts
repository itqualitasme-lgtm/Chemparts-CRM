import 'server-only'
import { db } from '@/lib/db'
import {
  filterProducts,
  type CatalogProduct,
  type ProductFilter,
  type ProductType,
} from '@/lib/catalog-filter'

export type { CatalogProduct, ProductFilter, ProductType } from '@/lib/catalog-filter'

type ProductRow = {
  slug: string
  name: string
  type: ProductType
  featured: boolean
  image: string | null
  images: string[]
  desc: string
  industries: string[]
  testTypes: string[]
  standards: string[]
  specs: unknown
  overview: string | null
  listPrice: unknown
  currency: string
  brand: { name: string }
}

function mapRow(row: ProductRow): CatalogProduct {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand.name,
    type: row.type,
    featured: row.featured,
    image: row.image,
    images: row.images,
    desc: row.desc,
    industries: row.industries,
    testTypes: row.testTypes,
    specs: (row.specs as Record<string, string>) ?? {},
    standards: row.standards,
    overview: row.overview ?? '',
    listPrice: row.listPrice != null ? Number(row.listPrice) : null,
    currency: row.currency,
  }
}

const productSelect = {
  slug: true,
  name: true,
  type: true,
  featured: true,
  image: true,
  images: true,
  desc: true,
  industries: true,
  testTypes: true,
  standards: true,
  specs: true,
  overview: true,
  listPrice: true,
  currency: true,
  brand: { select: { name: true } },
} as const

export async function getProducts(filter: ProductFilter): Promise<CatalogProduct[]> {
  const rows = await db.product.findMany({
    where: { active: true },
    select: productSelect,
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  })
  return filterProducts(rows.map(mapRow), filter)
}

export async function getProduct(slug: string): Promise<CatalogProduct | null> {
  const row = await db.product.findUnique({ where: { slug }, select: productSelect })
  return row ? mapRow(row) : null
}

export async function getBrands(): Promise<{ name: string; count: number }[]> {
  const brands = await db.brand.findMany({
    select: { name: true, _count: { select: { products: { where: { active: true } } } } },
    orderBy: { name: 'asc' },
  })
  return brands
    .map((b) => ({ name: b.name, count: b._count.products }))
    .filter((b) => b.count > 0)
}

export async function getIndustries(): Promise<string[]> {
  const rows = await db.product.findMany({ where: { active: true }, select: { industries: true } })
  return [...new Set(rows.flatMap((r) => r.industries))].sort()
}
