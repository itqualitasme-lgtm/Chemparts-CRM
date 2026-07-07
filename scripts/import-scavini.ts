import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Importer for the Scavini (scavini.com/en) petroleum-testing catalogue. Reads
// the scraped manifest, creates the product-type categories, uploads images ->
// product-images bucket, and upserts under the Scavini brand. Scavini publishes
// no public datasheet PDFs (downloads are login-gated), so datasheetUrl stays
// null. Same rules as Biolab/Tanaka: idempotent, request-price, replace old rows.

const MANIFEST = process.env.SCAVINI_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const IMG_BUCKET = 'product-images'
const UA = { 'User-Agent': 'Mozilla/5.0' }

type Row = { url: string; id: string; catSlug: string; catName: string; name: string; desc: string; image: string | null; images: string[]; standards: string[]; error?: string }

// Normalize standard tokens: uppercase the prefix, collapse spaces, dedupe
// case-insensitively (source mixes "iso 3016" / "ISO 3016").
function normStandards(list: string[]): string[] {
  const seen = new Map<string, string>()
  for (const raw of list) {
    const s = raw.replace(/\s+/g, ' ').trim().replace(/^(astm d|astm|ip|iso|din|en)\b/i, (x) => x.toUpperCase())
    const k = s.replace(/\s+/g, '').toLowerCase()
    if (s && !seen.has(k)) seen.set(k, s)
  }
  return [...seen.values()]
}

// Light cleanup of the Italian supplier's imperfect English in names.
function cleanName(n: string): string {
  return n.replace(/\bManuale\b/g, 'Manual').replace(/\bGasoli\b/g, 'Gas Oil').replace(/\s+/g, ' ').trim()
}

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
  const valid = rows.filter((r) => !r.error && r.name)
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${valid.length} products`)

  const brand = await db.brand.findFirst({ where: { slug: 'scavini' }, select: { id: true } })
  if (!brand) throw new Error('Scavini brand not found')

  // Categories from the manifest.
  const catId: Record<string, string> = {}
  const distinctCats = new Map<string, string>()
  valid.forEach((r) => { if (r.catSlug && r.catName) distinctCats.set(r.catSlug, r.catName) })
  let sort = 40
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

  // Existing slugs owned by OTHER brands — never upsert onto these, or we'd
  // hijack another brand's product (the upsert key is the global unique slug).
  const foreign = new Set(
    (await db.product.findMany({ where: { brandId: { not: brand.id } }, select: { slug: true } })).map((p) => p.slug),
  )

  // Build stable, unique slugs: slugify(name), disambiguated against both this
  // run and other brands (suffix with the brand name on a cross-brand clash).
  const usedSlug = new Set<string>()
  const withSlug = valid.map((r) => {
    let base = slugify(cleanName(r.name)).slice(0, 70).replace(/-+$/, '')
    let slug = base
    if (foreign.has(slug)) slug = `${base}-scavini`
    if (usedSlug.has(slug)) slug = `${base}-${r.id}`
    usedSlug.add(slug)
    return { ...r, slug }
  })
  const newSlugs = new Set(withSlug.map((r) => r.slug))

  // Replace old (unreferenced) Scavini rows — the 15 legacy placeholders.
  if (APPLY) {
    const old = await db.product.findMany({
      where: { brandId: brand.id },
      select: { id: true, slug: true, _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } } },
    })
    const removable = old.filter((p) => !newSlugs.has(p.slug) && p._count.enquiryItems === 0 && p._count.cartItems === 0 && p._count.priceRequests === 0)
    if (removable.length) { await db.product.deleteMany({ where: { id: { in: removable.map((p) => p.id) } } }); console.log('removed old Scavini products:', removable.length) }
  }

  let done = 0, imgs = 0
  for (let i = 0; i < withSlug.length; i += 4) {
    await Promise.all(withSlug.slice(i, i + 4).map(async (r) => {
      const name = cleanName(r.name)
      const standards = normStandards(r.standards || [])
      if (APPLY) {
        const gallery = (r.images.length ? r.images : r.image ? [r.image] : []).slice(0, 8)
        const uploaded: string[] = []
        for (let n = 0; n < gallery.length; n++) {
          const url = await store(gallery[n], `scavini/products/${r.slug}-${n}.jpg`)
          if (url) uploaded.push(url)
        }
        if (uploaded.length) imgs += uploaded.length
        await db.product.upsert({
          where: { slug: r.slug },
          create: {
            slug: r.slug, name, brandId: brand.id, categoryId: catId[r.catSlug] ?? null, type: 'EQUIPMENT',
            desc: r.desc || name, overview: r.desc || null,
            image: uploaded[0] ?? null, images: uploaded,
            standards, priceMode: 'ON_REQUEST', currency: 'AED', active: true, industries: [], testTypes: [],
          },
          update: {
            name, categoryId: catId[r.catSlug] ?? null, type: 'EQUIPMENT',
            desc: r.desc || name, overview: r.desc || null,
            ...(uploaded.length ? { image: uploaded[0], images: uploaded } : {}),
            standards, priceMode: 'ON_REQUEST',
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
