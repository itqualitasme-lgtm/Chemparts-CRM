import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Importer for the Hitachi High-Tech Analytical Science (hha.hitachi-hightech.com)
// range — XRF, OES, LIBS and thermal analyzers. ADDITIVE: it upserts the curated
// new models and files the pre-existing flagship XRF products into categories,
// but never deletes existing Hitachi rows. No public datasheet PDFs on the site.

const MANIFEST = process.env.HITACHI_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const IMG_BUCKET = 'product-images'
const UA = { 'User-Agent': 'Mozilla/5.0' }

type Row = { name: string; category: string; catSlug: string; desc: string; image: string | null; images: string[]; source: string }

// Categorise the 4 flagship products already in the catalogue.
const EXISTING_CAT: Record<string, string> = {
  'ea1400': 'Benchtop XRF Analyzers',
  'lab-x5000': 'Benchtop XRF Analyzers',
  'x-supreme-8000': 'Benchtop XRF Analyzers',
  'x-strata920': 'Coatings & Thickness Analyzers',
}

async function store(remoteUrl: string, destPath: string): Promise<string | null> {
  try {
    const r = await fetch(remoteUrl, { headers: UA })
    if (!r.ok) return null
    const buf = Buffer.from(await r.arrayBuffer())
    const ct = r.headers.get('content-type') || 'image/png'
    const { error } = await supabase.storage.from(IMG_BUCKET).upload(destPath, buf, { contentType: ct, upsert: true })
    if (error) { console.error('  upload failed', destPath, error.message); return null }
    return supabase.storage.from(IMG_BUCKET).getPublicUrl(destPath).data.publicUrl
  } catch { return null }
}

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${rows.length} products`)

  const brand = await db.brand.findFirst({ where: { slug: 'hitachi' }, select: { id: true } })
  if (!brand) throw new Error('Hitachi brand not found')

  // Categories (from manifest + the existing-product categories).
  const catId: Record<string, string> = {}
  const cats = new Map<string, string>()
  rows.forEach((r) => cats.set(r.catSlug, r.category))
  for (const c of Object.values(EXISTING_CAT)) cats.set(c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), c)
  let sort = 60
  for (const [cslug, cname] of cats) {
    if (APPLY) {
      const rec = await db.category.upsert({ where: { slug: cslug }, create: { name: cname, slug: cslug, type: 'EQUIPMENT', sortOrder: sort++ }, update: { name: cname, type: 'EQUIPMENT' }, select: { id: true } })
      catId[cslug] = rec.id
    }
  }
  console.log('categories:', cats.size)

  // Guard: never upsert onto a slug owned by another brand.
  const foreign = new Set((await db.product.findMany({ where: { brandId: { not: brand.id } }, select: { slug: true } })).map((p) => p.slug))

  let done = 0, imgs = 0
  for (const r of rows) {
    let base = slugify(r.name).slice(0, 70).replace(/-+$/, '')
    const slug = foreign.has(base) ? `${base}-hitachi` : base
    if (APPLY) {
      const gallery = (r.images.length ? r.images : r.image ? [r.image] : []).slice(0, 4)
      const uploaded: string[] = []
      for (let n = 0; n < gallery.length; n++) {
        const ext = (gallery[n].split('.').pop() || 'png').split(/[?#]/)[0].toLowerCase()
        const url = await store(gallery[n], `hitachi/products/${slug}-${n}.${ext}`)
        if (url) uploaded.push(url)
      }
      if (uploaded.length) imgs += uploaded.length
      await db.product.upsert({
        where: { slug },
        create: {
          slug, name: r.name, brandId: brand.id, categoryId: catId[r.catSlug] ?? null, type: 'EQUIPMENT',
          desc: r.desc || r.name, overview: r.desc || null,
          image: uploaded[0] ?? null, images: uploaded,
          standards: [], priceMode: 'ON_REQUEST', currency: 'AED', active: true, industries: [], testTypes: [],
        },
        update: {
          name: r.name, categoryId: catId[r.catSlug] ?? null, type: 'EQUIPMENT',
          desc: r.desc || r.name, overview: r.desc || null,
          ...(uploaded.length ? { image: uploaded[0], images: uploaded } : {}), priceMode: 'ON_REQUEST',
        },
      })
    }
    done++
    console.log(`  ${done}/${rows.length} ${slug}`)
  }

  // File the pre-existing flagship products into their categories.
  if (APPLY) {
    for (const [pslug, cname] of Object.entries(EXISTING_CAT)) {
      const cid = catId[cname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')]
      if (cid) await db.product.updateMany({ where: { slug: pslug, brandId: brand.id }, data: { categoryId: cid } })
    }
    console.log('filed existing flagship products into categories')
  }

  console.log(`\nDONE: ${done} products | ${imgs} images`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
