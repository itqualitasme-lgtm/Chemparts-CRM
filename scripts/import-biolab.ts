import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// One-time importer for the Biolab catalogue scraped from biolab.com.tr.
// Reads the local manifest (name/image/datasheet/standards/category), downloads
// each image + datasheet, stores them in Supabase Storage, and upserts the
// products under the Biolab brand. Idempotent (upsert by slug, upsert storage).

const MANIFEST = process.env.BIOLAB_MANIFEST as string
const APPLY = process.argv.includes('--apply')

const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const BUCKET = 'product-images'

type Row = { slug: string; name: string; image: string | null; desc: string; datasheet: string | null; standards: string[]; cats: string[]; error?: string }

const CATEGORIES: { slug: string; name: string; type: 'EQUIPMENT' | 'CONSUMABLE'; sort: number }[] = [
  { slug: 'petrochemistry', name: 'Petrochemistry', type: 'EQUIPMENT', sort: 1 },
  { slug: 'used-oil-predictive', name: 'Used Oil / Predictive Maintenance', type: 'EQUIPMENT', sort: 2 },
  { slug: 'environment-chemistry', name: 'Environment & Chemistry', type: 'EQUIPMENT', sort: 3 },
  { slug: 'tribology', name: 'Tribology', type: 'EQUIPMENT', sort: 4 },
  { slug: 'gas-chromatography', name: 'Gas Chromatography', type: 'EQUIPMENT', sort: 5 },
  { slug: 'on-line-analyzers', name: 'On-line Analyzers', type: 'EQUIPMENT', sort: 6 },
  { slug: 'consumables', name: 'Consumables', type: 'CONSUMABLE', sort: 7 },
]

/** Pick one primary category. Products tagged with 6+ categories are the site's
 *  nav-featured items — pin those to petrochemistry. */
function primaryCat(cats: string[]): string {
  if (cats.length >= 6) return 'petrochemistry'
  return cats[0] || 'petrochemistry'
}

async function download(url: string): Promise<{ buf: Buffer; ct: string } | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!r.ok) return null
    return { buf: Buffer.from(await r.arrayBuffer()), ct: r.headers.get('content-type') || 'application/octet-stream' }
  } catch {
    return null
  }
}

async function store(remoteUrl: string, destPath: string, forceType?: string): Promise<string | null> {
  const dl = await download(remoteUrl)
  if (!dl) return null
  const { error } = await supabase.storage.from(BUCKET).upload(destPath, dl.buf, { contentType: forceType || dl.ct, upsert: true })
  if (error) { console.error('  upload failed', destPath, error.message); return null }
  return supabase.storage.from(BUCKET).getPublicUrl(destPath).data.publicUrl
}

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const valid = rows.filter((r) => !r.error && r.name && r.slug)
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${valid.length} products`)

  const brand = await db.brand.findFirst({ where: { slug: 'biolab' }, select: { id: true } })
  if (!brand) throw new Error('Biolab brand not found')

  // Categories
  const catId: Record<string, string> = {}
  for (const c of CATEGORIES) {
    if (APPLY) {
      const rec = await db.category.upsert({
        where: { slug: c.slug },
        create: { name: c.name, slug: c.slug, type: c.type, sortOrder: c.sort },
        update: { name: c.name, type: c.type, sortOrder: c.sort },
        select: { id: true },
      })
      catId[c.slug] = rec.id
    }
  }
  console.log('categories ready:', CATEGORIES.length)

  // Remove the old mangled Biolab products (only those not referenced) so the
  // fresh, complete catalogue replaces them.
  if (APPLY) {
    const old = await db.product.findMany({
      where: { brandId: brand.id },
      select: { id: true, slug: true, _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } } },
    })
    const newSlugs = new Set(valid.map((r) => slugify(r.slug)))
    const removable = old.filter((p) => !newSlugs.has(p.slug) && p._count.enquiryItems === 0 && p._count.cartItems === 0 && p._count.priceRequests === 0)
    if (removable.length) {
      await db.product.deleteMany({ where: { id: { in: removable.map((p) => p.id) } } })
      console.log('removed old Biolab products:', removable.length)
    }
  }

  const catType: Record<string, 'EQUIPMENT' | 'CONSUMABLE'> = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.type]))
  let done = 0, imgs = 0, dts = 0
  const BATCH = 5
  for (let i = 0; i < valid.length; i += BATCH) {
    await Promise.all(valid.slice(i, i + BATCH).map(async (r) => {
      const slug = slugify(r.slug)
      const cat = primaryCat(r.cats)
      const type = catType[cat] || 'EQUIPMENT'
      let imageUrl: string | null = null
      let datasheetUrl: string | null = null
      if (APPLY) {
        if (r.image) { const ext = (r.image.split('.').pop() || 'jpg').split(/[?#]/)[0].toLowerCase(); imageUrl = await store(r.image, `biolab/products/${slug}.${ext}`); if (imageUrl) imgs++ }
        if (r.datasheet) { datasheetUrl = await store(decodeURI(r.datasheet), `biolab/datasheets/${slug}.pdf`, 'application/pdf'); if (datasheetUrl) dts++ }
        await db.product.upsert({
          where: { slug },
          create: {
            slug, name: r.name, brandId: brand.id, categoryId: catId[cat] ?? null, type,
            desc: r.desc || r.name, overview: r.desc || null,
            image: imageUrl, images: imageUrl ? [imageUrl] : [],
            standards: r.standards ?? [], datasheetUrl,
            priceMode: 'ON_REQUEST', currency: 'AED', active: true,
            industries: [], testTypes: [],
          },
          update: {
            name: r.name, categoryId: catId[cat] ?? null, type, desc: r.desc || r.name, overview: r.desc || null,
            ...(imageUrl ? { image: imageUrl, images: [imageUrl] } : {}),
            standards: r.standards ?? [], ...(datasheetUrl ? { datasheetUrl } : {}),
            priceMode: 'ON_REQUEST',
          },
        })
      }
      done++
    }))
    console.log(`${done}/${valid.length}`)
  }
  console.log(`\nDONE: ${done} products | ${imgs} images stored | ${dts} datasheets stored`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
