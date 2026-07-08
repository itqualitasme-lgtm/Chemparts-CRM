import { NextResponse } from 'next/server'
import { getCatalogDetail } from '@/lib/catalog-data'

// On-demand product detail for the vanilla-JS product page. The lean catalogue in
// window.PRODUCTS omits the heavy per-product fields (gallery images, spec table,
// overview, docs) to keep the every-page payload small; product-detail.js fetches
// them here when a product page opens. Cacheable — product data changes rarely.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const detail = await getCatalogDetail(slug)
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(detail, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
