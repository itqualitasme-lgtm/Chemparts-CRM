import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addToQuote } from '@/lib/cart-actions'

// Public endpoint used by the vanilla-JS product pages (/products, /product) to
// add an item to the cart. Accepts a slug or productId; equipment goes in as a
// quote-only line, priced items carry their price. Returns the new cart count.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // ignore
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const slug = str(body.slug)
  let productId = str(body.productId)
  const qtyRaw = Number(body.qty)
  const qty = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.floor(qtyRaw) : 1

  if (!productId && slug) {
    const p = await db.product.findUnique({ where: { slug }, select: { id: true } })
    productId = p?.id ?? ''
  }
  if (!productId) return NextResponse.json({ ok: false, error: 'Product not found.' }, { status: 404 })

  const res = await addToQuote(productId, qty)
  if (res.error) return NextResponse.json({ ok: false, error: res.error }, { status: 400 })
  return NextResponse.json({ ok: true, count: res.count ?? 0 })
}
