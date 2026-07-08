import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Importer for the Tamson Instruments (tamsoninstruments.com) catalogue — mercury /
// atomic-absorption analyzers, capillary electrophoresis, FT-NIR & IR, luminescence,
// PCR and water analyzers. PHP catalog pages; name/desc/images/standards extracted
// per page. Replaces the single legacy placeholder. Cross-brand slug guarded.

const MANIFEST = process.env.TAMSON_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const IMG_BUCKET = 'product-images'
const UA = { 'User-Agent': 'Mozilla/5.0 Chrome/120.0' }

type Row = { slug: string; name: string; category: string; catSlug: string; desc: string; image: string | null; images: string[]; standards: string[] }

async function store(remoteUrl: string, destPath: string): Promise<string | null> {
  try {
    const r = await fetch(remoteUrl, { headers: UA })
    if (!r.ok) return null
    const buf = Buffer.from(await r.arrayBuffer())
    const ct = r.headers.get('content-type') || 'image/jpeg'
    const { error } = await supabase.storage.from(IMG_BUCKET).upload(destPath, buf, { contentType: ct, upsert: true })
    if (error) { console.error('  upload failed', destPath, error.message); return null }
    return supabase.storage.from(IMG_BUCKET).getPublicUrl(destPath).data.publicUrl
  } catch { return null }
}

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${rows.length} products`)

  const brand = await db.brand.findFirst({ where: { slug: 'tamson' }, select: { id: true } })
  if (!brand) throw new Error('Tamson brand not found')

  const catId: Record<string, string> = {}
  const cats = new Map<string, string>()
  rows.forEach((r) => cats.set(r.catSlug, r.category))
  let sort = 130
  for (const [cslug, cname] of cats) {
    if (APPLY) {
      const rec = await db.category.upsert({ where: { slug: cslug }, create: { name: cname, slug: cslug, type: 'EQUIPMENT', sortOrder: sort++ }, update: { name: cname }, select: { id: true } })
      catId[cslug] = rec.id
    }
  }
  console.log('categories:', cats.size)

  const foreign = new Set((await db.product.findMany({ where: { brandId: { not: brand.id } }, select: { slug: true } })).map((p) => p.slug))
  // Tamson's method-name slugs are near-identical past 70 chars (…-tv4000 vs
  // …-tv2000), so truncation collides. Dedup within the run: reserve room and
  // append the distinguishing trailing token, then a counter as a last resort.
  const used = new Set<string>()
  const withSlug = rows.map((r) => {
    const full = slugify(`tamson ${r.slug}`)
    let base = full.slice(0, 62).replace(/-+$/, '')
    if (foreign.has(base) || used.has(base)) {
      const tail = full.split('-').pop() || ''
      base = `${base}-${tail}`.slice(0, 72).replace(/-+$/, '')
    }
    let slug = base, n = 2
    while (foreign.has(slug) || used.has(slug)) slug = `${base}-${n++}`
    used.add(slug)
    return { ...r, pslug: slug }
  })
  const newSlugs = new Set(withSlug.map((r) => r.pslug))

  if (APPLY) {
    const old = await db.product.findMany({
      where: { brandId: brand.id },
      select: { id: true, slug: true, _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } } },
    })
    const removable = old.filter((p) => !newSlugs.has(p.slug) && p._count.enquiryItems === 0 && p._count.cartItems === 0 && p._count.priceRequests === 0)
    if (removable.length) { await db.product.deleteMany({ where: { id: { in: removable.map((p) => p.id) } } }); console.log('removed old Tamson products:', removable.length) }
  }

  let done = 0, imgs = 0
  for (let i = 0; i < withSlug.length; i += 4) {
    await Promise.all(withSlug.slice(i, i + 4).map(async (r) => {
      if (APPLY) {
        const gallery = (r.images.length ? r.images : r.image ? [r.image] : []).slice(0, 4)
        const uploaded: string[] = []
        for (let n = 0; n < gallery.length; n++) {
          const ext = (gallery[n].split('.').pop() || 'jpg').split(/[?#]/)[0].toLowerCase()
          const url = await store(gallery[n], `tamson/products/${r.pslug}-${n}.${ext}`)
          if (url) uploaded.push(url)
        }
        if (uploaded.length) imgs += uploaded.length
        // Upgrade kits / fluids / standards / viscometers are consumables; the
        // baths and testers are equipment.
        const ptype = /\b(upgrade kit|kit|fluid|standard|viscometer|accessor)/i.test(r.name) ? 'CONSUMABLE' : 'EQUIPMENT'
        await db.product.upsert({
          where: { slug: r.pslug },
          create: {
            slug: r.pslug, name: r.name, brandId: brand.id, categoryId: catId[r.catSlug] ?? null, type: ptype,
            desc: r.desc || r.name, overview: r.desc || null,
            image: uploaded[0] ?? null, images: uploaded,
            standards: r.standards ?? [], priceMode: 'ON_REQUEST', currency: 'AED', active: true, industries: [], testTypes: [],
          },
          update: {
            name: r.name, categoryId: catId[r.catSlug] ?? null, type: ptype,
            desc: r.desc || r.name, overview: r.desc || null,
            ...(uploaded.length ? { image: uploaded[0], images: uploaded } : {}), standards: r.standards ?? [], priceMode: 'ON_REQUEST',
          },
        })
      }
      done++
    }))
    console.log(`${done}/${withSlug.length}`)
  }
  console.log(`\nDONE: ${done} products | ${imgs} images`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
