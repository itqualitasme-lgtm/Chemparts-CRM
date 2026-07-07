import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Importer for the Tanaka (tanaka-sci.com) English catalogue. Reads the scraped
// manifest, creates the product-type categories, uploads images -> product-images
// bucket and datasheets -> documents bucket, and upserts under the Tanaka brand.
// Same rules as the Biolab import (idempotent, request-price, replace old rows).

const MANIFEST = process.env.TANAKA_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const IMG_BUCKET = 'product-images'
const DOC_BUCKET = 'documents'
const UA = { 'User-Agent': 'Mozilla/5.0' }

type Row = { slug: string; name: string; image: string | null; images: string[]; desc: string; datasheets: string[]; standards: string[]; catSlug: string | null; catName: string | null; error?: string }

async function store(remoteUrl: string, bucket: string, destPath: string, forceType?: string): Promise<string | null> {
  try {
    const r = await fetch(remoteUrl, { headers: UA })
    if (!r.ok) return null
    const buf = Buffer.from(await r.arrayBuffer())
    const ct = forceType || r.headers.get('content-type') || 'application/octet-stream'
    const { error } = await supabase.storage.from(bucket).upload(destPath, buf, { contentType: ct, upsert: true })
    if (error) { console.error('  upload failed', destPath, error.message); return null }
    return supabase.storage.from(bucket).getPublicUrl(destPath).data.publicUrl
  } catch { return null }
}

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const valid = rows.filter((r) => !r.error && r.name && r.slug)
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${valid.length} products`)

  const brand = await db.brand.findFirst({ where: { slug: 'tanaka' }, select: { id: true } })
  if (!brand) throw new Error('Tanaka brand not found')

  // Categories from the manifest (product-type "Tester" categories).
  const catId: Record<string, string> = {}
  const distinctCats = new Map<string, string>()
  valid.forEach((r) => { if (r.catSlug && r.catName) distinctCats.set(r.catSlug, r.catName) })
  let sort = 20
  for (const [cslug, cname] of distinctCats) {
    if (APPLY) {
      const rec = await db.category.upsert({
        where: { slug: cslug },
        create: { name: cname, slug: cslug, type: 'EQUIPMENT', sortOrder: sort++ },
        update: { name: cname, type: 'EQUIPMENT' },
        select: { id: true },
      })
      catId[cslug] = rec.id
    }
  }
  console.log('categories:', distinctCats.size)

  // Replace old (unreferenced) Tanaka rows.
  if (APPLY) {
    const old = await db.product.findMany({
      where: { brandId: brand.id },
      select: { id: true, slug: true, _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } } },
    })
    const newSlugs = new Set(valid.map((r) => slugify(r.slug)))
    const removable = old.filter((p) => !newSlugs.has(p.slug) && p._count.enquiryItems === 0 && p._count.cartItems === 0 && p._count.priceRequests === 0)
    if (removable.length) { await db.product.deleteMany({ where: { id: { in: removable.map((p) => p.id) } } }); console.log('removed old Tanaka products:', removable.length) }
  }

  let done = 0, imgs = 0, dts = 0
  for (let i = 0; i < valid.length; i += 4) {
    await Promise.all(valid.slice(i, i + 4).map(async (r) => {
      const slug = slugify(r.slug)
      if (APPLY) {
        const gallery = (r.images.length ? r.images : r.image ? [r.image] : []).slice(0, 8)
        const uploaded: string[] = []
        for (let n = 0; n < gallery.length; n++) {
          const ext = (gallery[n].split('.').pop() || 'jpg').split(/[?#]/)[0].toLowerCase()
          const url = await store(gallery[n], IMG_BUCKET, `tanaka/products/${slug}-${n}.${ext}`)
          if (url) uploaded.push(url)
        }
        if (uploaded.length) imgs += uploaded.length
        let datasheetUrl: string | null = null
        if (r.datasheets[0]) { datasheetUrl = await store(decodeURI(r.datasheets[0]), DOC_BUCKET, `tanaka/${slug}.pdf`, 'application/pdf'); if (datasheetUrl) dts++ }
        await db.product.upsert({
          where: { slug },
          create: {
            slug, name: r.name, brandId: brand.id, categoryId: r.catSlug ? catId[r.catSlug] ?? null : null, type: 'EQUIPMENT',
            desc: r.desc || r.name, overview: r.desc || null,
            image: uploaded[0] ?? null, images: uploaded,
            standards: r.standards ?? [], datasheetUrl,
            priceMode: 'ON_REQUEST', currency: 'AED', active: true, industries: [], testTypes: [],
          },
          update: {
            name: r.name, categoryId: r.catSlug ? catId[r.catSlug] ?? null : null, type: 'EQUIPMENT',
            desc: r.desc || r.name, overview: r.desc || null,
            ...(uploaded.length ? { image: uploaded[0], images: uploaded } : {}),
            standards: r.standards ?? [], ...(datasheetUrl ? { datasheetUrl } : {}), priceMode: 'ON_REQUEST',
          },
        })
      }
      done++
    }))
    console.log(`${done}/${valid.length}`)
  }
  console.log(`\nDONE: ${done} products | ${imgs} images | ${dts} datasheets`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
