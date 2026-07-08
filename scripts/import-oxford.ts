import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Importer for the Oxford Instruments Magnetic Resonance (nmr.oxinst.com) range:
// the current benchtop-NMR line (X-Pulse, MQC+, GeoSpec). Replaces the two legacy
// duplicate X-Pulse rows. No public datasheet PDFs. Cross-brand slug guarded.

const MANIFEST = process.env.OXFORD_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const IMG_BUCKET = 'product-images'
const UA = { 'User-Agent': 'Mozilla/5.0' }

type Row = { name: string; category: string; catSlug: string; desc: string; image: string | null; images: string[]; source: string }

async function store(remoteUrl: string, destPath: string): Promise<string | null> {
  try {
    const r = await fetch(encodeURI(remoteUrl), { headers: UA })
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

  const brand = await db.brand.findFirst({ where: { slug: 'oxford-instruments' }, select: { id: true } })
  if (!brand) throw new Error('Oxford Instruments brand not found')

  const catId: Record<string, string> = {}
  const cats = new Map<string, string>()
  rows.forEach((r) => cats.set(r.catSlug, r.category))
  let sort = 80
  for (const [cslug, cname] of cats) {
    if (APPLY) {
      const rec = await db.category.upsert({ where: { slug: cslug }, create: { name: cname, slug: cslug, type: 'EQUIPMENT', sortOrder: sort++ }, update: { name: cname, type: 'EQUIPMENT' }, select: { id: true } })
      catId[cslug] = rec.id
    }
  }
  console.log('categories:', cats.size)

  const foreign = new Set((await db.product.findMany({ where: { brandId: { not: brand.id } }, select: { slug: true } })).map((p) => p.slug))
  const withSlug = rows.map((r) => {
    const base = slugify(r.name).slice(0, 70).replace(/-+$/, '')
    return { ...r, slug: foreign.has(base) ? `${base}-oxford` : base }
  })
  const newSlugs = new Set(withSlug.map((r) => r.slug))

  // Replace old (unreferenced) Oxford rows — the 2 legacy X-Pulse duplicates.
  if (APPLY) {
    const old = await db.product.findMany({
      where: { brandId: brand.id },
      select: { id: true, slug: true, _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } } },
    })
    const removable = old.filter((p) => !newSlugs.has(p.slug) && p._count.enquiryItems === 0 && p._count.cartItems === 0 && p._count.priceRequests === 0)
    if (removable.length) { await db.product.deleteMany({ where: { id: { in: removable.map((p) => p.id) } } }); console.log('removed old Oxford products:', removable.length) }
  }

  let done = 0, imgs = 0
  for (const r of withSlug) {
    if (APPLY) {
      const gallery = (r.images.length ? r.images : r.image ? [r.image] : []).slice(0, 3)
      const uploaded: string[] = []
      for (let n = 0; n < gallery.length; n++) {
        const ext = (gallery[n].split('.').pop() || 'png').split(/[?#]/)[0].toLowerCase()
        const url = await store(gallery[n], `oxford/products/${r.slug}-${n}.${ext}`)
        if (url) uploaded.push(url)
      }
      if (uploaded.length) imgs += uploaded.length
      await db.product.upsert({
        where: { slug: r.slug },
        create: {
          slug: r.slug, name: r.name, brandId: brand.id, categoryId: catId[r.catSlug] ?? null, type: 'EQUIPMENT',
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
    console.log(`  ${done}/${withSlug.length} ${r.slug}`)
  }
  console.log(`\nDONE: ${done} products | ${imgs} images`)
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
