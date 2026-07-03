import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { slugify } from '../src/lib/slug'

const db = new PrismaClient({ adapter: createPgAdapter() })

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

// Brand metadata from the real website (partners.html).
const BRAND_META: Record<string, { logo: string | null; country: string; focus: string; since: string }> = {
  Hitachi: { logo: 'hitachi.jpg', country: 'Japan', focus: 'XRF, EDX, elemental analysis', since: '2008' },
  Tanaka: { logo: 'tanaka.jpg', country: 'Japan', focus: 'Petroleum testing — flash point, distillation, pour point', since: '2010' },
  'Oxford Instruments': { logo: 'oxford.jpg', country: 'UK', focus: 'Benchtop NMR, mercury analyzers, XRF', since: '2012' },
  Tamson: { logo: 'pt-tamson-logo.jpg', country: 'Netherlands', focus: 'Temperature baths and viscosity instruments', since: '2013' },
  Nabertherm: { logo: 'nabertherm.webp', country: 'Germany', focus: 'Industrial furnaces and ashing ovens', since: '2014' },
  Normalab: { logo: 'normalab.svg', country: 'France', focus: 'Petroleum and lubricant testing apparatus', since: '2014' },
  Biolab: { logo: 'biolab.png', country: 'USA', focus: 'Mercury and chlorine analyzers', since: '2015' },
  Linetronics: { logo: 'linetronics.jpg', country: 'Germany', focus: 'Process and laboratory electronics', since: '2016' },
  'PG Instruments': { logo: 'pg-instruments.webp', country: 'UK', focus: 'UV-Vis spectroscopy and AAS', since: '2016' },
  'Peak Instruments': { logo: 'peak-instrument.jpg', country: 'USA', focus: 'Gas generators for chromatography labs', since: '2017' },
  Chromos: { logo: 'chromos.jpg', country: 'Russia', focus: 'Gas chromatography systems', since: '2018' },
  Mitsubishi: { logo: null, country: 'Japan', focus: 'Moisture analyzers, halogen and TOX', since: '2018' },
  Lumex: { logo: null, country: 'Russia', focus: 'Mercury and elemental analyzers', since: '2019' },
  Pruler: { logo: null, country: 'Germany', focus: 'Specialty laboratory instruments', since: '2020' },
  Scavini: { logo: null, country: 'Italy', focus: 'Bench-top petroleum testing', since: '2021' },
  Chemparts: { logo: null, country: 'UAE', focus: 'Chemparts in-house instruments and accessories', since: 'IN-HOUSE' },
}
const ANCHOR_BRANDS = ['Hitachi', 'Tanaka', 'Oxford Instruments']

async function main() {
  const file = path.join(process.cwd(), 'data', 'catalog.json')
  const catalog: CatalogItem[] = JSON.parse(fs.readFileSync(file, 'utf8'))

  const brandNames = [...new Set(catalog.map((p) => p.brand))]
  const brandIds = new Map<string, string>()
  for (const name of brandNames) {
    const m = BRAND_META[name]
    const data = {
      slug: slugify(name),
      logo: m?.logo ? `/images/brands/${m.logo}` : null,
      countryOfOrigin: m?.country ?? null,
      focus: m?.focus ?? null,
      partnerSince: m?.since ?? null,
      featured: ANCHOR_BRANDS.includes(name),
    }
    const brand = await db.brand.upsert({
      where: { name },
      create: { name, ...data },
      update: data,
    })
    brandIds.set(name, brand.id)
  }
  console.log(`brands: ${brandIds.size}`)

  let count = 0
  for (const p of catalog) {
    const common = {
      name: p.name,
      brandId: brandIds.get(p.brand)!,
      type: p.type,
      featured: p.featured,
      image: p.image,
      images: p.images,
      desc: p.desc,
      overview: p.overview,
      industries: p.industries,
      testTypes: p.testTypes,
      standards: p.standards,
      specs: p.specs,
      productType: p.specs?.type ?? null,
      sample: p.specs?.sample ?? null,
      output: p.specs?.output ?? null,
    }
    await db.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...common },
      update: common,
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
