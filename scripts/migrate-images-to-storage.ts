import 'dotenv/config'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { createPgAdapter } from '../src/lib/pg'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'

// One-time, idempotent migration of local image files into Supabase Storage.
// Uploads product/brand/client images that still point at repo files and
// rewrites the DB to the Storage public URL. Re-runnable (skips https values,
// upserts uploads). Local files are left in place as a fallback.

const db = new PrismaClient({ adapter: createPgAdapter() })
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
  auth: { autoRefreshToken: false, persistSession: false },
})
const BUCKET = 'product-images'
const PUBLIC = join(process.cwd(), 'public')
const APPLY = process.argv.includes('--apply')

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif',
}

const isRemote = (v: string | null | undefined) => !!v && /^https?:\/\//i.test(v)

/** Resolve a stored image value to the local file on disk (or null). */
function localPath(value: string, kind: 'product' | 'brand' | 'client'): string | null {
  let rel: string
  if (value.startsWith('/')) rel = value.slice(1)
  else if (value.startsWith('assets/') || value.startsWith('images/')) rel = value
  else rel = kind === 'product' ? `assets/images/products/${value}` : value
  const p = join(PUBLIC, rel)
  return existsSync(p) ? p : null
}

let uploaded = 0
let skipped = 0
let missing = 0

/** Upload one local file to Storage; return its public URL (or null). */
async function upload(file: string, destPath: string): Promise<string | null> {
  const ext = (file.split('.').pop() || 'png').toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  if (!APPLY) { console.log(`  would upload -> ${destPath}`); uploaded++; return `DRYRUN/${destPath}` }
  const buf = readFileSync(file)
  const { error } = await supabase.storage.from(BUCKET).upload(destPath, buf, { contentType, upsert: true })
  if (error) { console.log(`  UPLOAD FAILED ${destPath}: ${error.message}`); return null }
  uploaded++
  return supabase.storage.from(BUCKET).getPublicUrl(destPath).data.publicUrl
}

async function migrateProducts() {
  console.log('\n== Products ==')
  const rows = await db.product.findMany({ select: { id: true, slug: true, image: true, images: true } })
  for (const p of rows) {
    const mapOne = async (val: string): Promise<string> => {
      if (isRemote(val)) { skipped++; return val }
      const lp = localPath(val, 'product')
      if (!lp) { missing++; console.log(`  MISSING ${val}`); return val }
      const filename = lp.split(/[\\/]/).pop()!
      const url = await upload(lp, `products/${filename}`)
      return url ?? val
    }
    const newImage = p.image ? await mapOne(p.image) : null
    const newImages: string[] = []
    for (const im of p.images) newImages.push(await mapOne(im))
    if (APPLY && (newImage !== p.image || JSON.stringify(newImages) !== JSON.stringify(p.images))) {
      await db.product.update({ where: { id: p.id }, data: { image: newImage, images: newImages } })
    }
  }
}

async function migrateBrands() {
  console.log('\n== Brands ==')
  const rows = await db.brand.findMany({ select: { id: true, slug: true, logo: true } })
  for (const b of rows) {
    if (!b.logo || isRemote(b.logo)) { if (b.logo) skipped++; continue }
    const lp = localPath(b.logo, 'brand')
    if (!lp) { missing++; console.log(`  MISSING ${b.logo}`); continue }
    const filename = lp.split(/[\\/]/).pop()!
    const url = await upload(lp, `brands/${filename}`)
    if (APPLY && url) await db.brand.update({ where: { id: b.id }, data: { logo: url } })
  }
}

async function migrateClients() {
  console.log('\n== Clients ==')
  const rows = await db.client.findMany({ select: { id: true, logo: true } })
  for (const c of rows) {
    if (!c.logo || isRemote(c.logo)) { if (c.logo) skipped++; continue }
    const lp = localPath(c.logo, 'client')
    if (!lp) { missing++; console.log(`  MISSING ${c.logo}`); continue }
    const filename = lp.split(/[\\/]/).pop()!
    const url = await upload(lp, `clients/${filename}`)
    if (APPLY && url) await db.client.update({ where: { id: c.id }, data: { logo: url } })
  }
}

async function main() {
  console.log(APPLY ? 'APPLYING migration…' : 'DRY RUN (pass --apply to migrate)')
  await migrateProducts()
  await migrateBrands()
  await migrateClients()
  console.log(`\nSummary: uploaded=${uploaded} skipped(alreadyRemote)=${skipped} missingFiles=${missing}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
