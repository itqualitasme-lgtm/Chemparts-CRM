import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { databaseUrl } from '../src/lib/env'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl() }),
})

type CatalogItem = {
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

async function main() {
  const file = path.join(process.cwd(), 'data', 'catalog.json')
  const catalog: CatalogItem[] = JSON.parse(fs.readFileSync(file, 'utf8'))

  const brandNames = [...new Set(catalog.map((p) => p.brand))]
  const brandIds = new Map<string, string>()
  for (const name of brandNames) {
    const brand = await db.brand.upsert({ where: { name }, create: { name }, update: {} })
    brandIds.set(name, brand.id)
  }
  console.log(`brands: ${brandIds.size}`)

  let count = 0
  for (const p of catalog) {
    await db.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        type: p.type,
        brandId: brandIds.get(p.brand)!,
        featured: p.featured,
        image: p.image,
        images: p.images,
        desc: p.desc,
        overview: p.overview,
        industries: p.industries,
        testTypes: p.testTypes,
        standards: p.standards,
        specs: p.specs,
      },
      update: {
        name: p.name,
        brandId: brandIds.get(p.brand)!,
        featured: p.featured,
        image: p.image,
        images: p.images,
        desc: p.desc,
        overview: p.overview,
        industries: p.industries,
        testTypes: p.testTypes,
        standards: p.standards,
        specs: p.specs,
      },
    })
    count++
  }
  console.log(`products: ${count}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
