import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { db } from '../src/lib/db'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { slugify } from '../src/lib/slug'

// Second pass over the Biolab catalogue: re-scrape each product page for its
// FULL image gallery (WooCommerce data-thumbnail entries, size-suffix stripped),
// upload every image to Supabase Storage, and set product.images = [all].
// Idempotent (upsert storage, deterministic paths).

const MANIFEST = process.env.BIOLAB_MANIFEST as string
const APPLY = process.argv.includes('--apply')
const supabase = createClient(supabaseUrl(), supabaseServiceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } })
const BUCKET = 'product-images'
const UA = { 'User-Agent': 'Mozilla/5.0' }

async function galleryOf(slug: string): Promise<string[]> {
  try {
    const r = await fetch(`https://biolab.com.tr/en/prd/${slug}/`, { headers: UA })
    if (!r.ok) return []
    const html = await r.text()
    const thumbs = [...html.matchAll(/data-thumbnail="([^"]+)"/g)].map((m) => m[1])
    // strip the -75x50 (or any -WxH) size suffix to get the full-size original
    const full = thumbs.map((u) => u.replace(/-\d+x\d+(\.[a-z]+)(\?|$)/i, '$1'))
    // og:image is the primary; put it first if present
    const og = (html.match(/og:image"\s*content="([^"]+)"/) || [])[1]
    const ordered = og ? [og, ...full.filter((u) => u !== og)] : full
    return [...new Set(ordered)].filter((u) => /\.(jpe?g|png|webp)$/i.test(u))
  } catch {
    return []
  }
}

async function upload(remoteUrl: string, destPath: string): Promise<string | null> {
  try {
    const r = await fetch(remoteUrl, { headers: UA })
    if (!r.ok) return null
    const buf = Buffer.from(await r.arrayBuffer())
    const ct = r.headers.get('content-type') || 'image/jpeg'
    const { error } = await supabase.storage.from(BUCKET).upload(destPath, buf, { contentType: ct, upsert: true })
    if (error) return null
    return supabase.storage.from(BUCKET).getPublicUrl(destPath).data.publicUrl
  } catch {
    return null
  }
}

async function main() {
  const rows = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { slug: string; name: string; error?: string }[]
  const valid = rows.filter((r) => !r.error && r.name && r.slug)
  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${valid.length} products`)

  let processed = 0, multi = 0, totalImgs = 0
  const BATCH = 5
  for (let i = 0; i < valid.length; i += BATCH) {
    await Promise.all(valid.slice(i, i + BATCH).map(async (r) => {
      const slug = slugify(r.slug)
      const gallery = await galleryOf(r.slug)
      // Only touch products that actually have a multi-image gallery; single-image
      // products already have their primary image from the first import.
      if (gallery.length <= 1) { processed++; return }
      multi++
      if (APPLY) {
        const urls: string[] = []
        for (let n = 0; n < gallery.length && n < 8; n++) {
          const ext = (gallery[n].split('.').pop() || 'jpg').split(/[?#]/)[0].toLowerCase()
          const url = await upload(gallery[n], `biolab/products/${slug}-${n}.${ext}`)
          if (url) urls.push(url)
        }
        if (urls.length) {
          totalImgs += urls.length
          await db.product.updateMany({ where: { slug, brand: { slug: 'biolab' } }, data: { image: urls[0], images: urls } })
        }
      } else {
        totalImgs += gallery.length
      }
      processed++
    }))
    if (i % 25 === 0) console.log(`${processed}/${valid.length}`)
  }
  console.log(`\nDONE: ${processed} processed | ${multi} have multiple images | ${totalImgs} images ${APPLY ? 'stored' : 'found'}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
