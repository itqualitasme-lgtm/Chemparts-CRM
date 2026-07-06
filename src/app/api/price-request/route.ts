import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'

// Public endpoint for the "Request price" action on product pages. Creates an
// OPEN PriceRequest against a product (by slug) and notifies staff + customer.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // ignore — validated below
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const name = str(body.name)
  const email = str(body.email)
  const company = str(body.company) || null
  const slug = str(body.slug)
  const message = str(body.message) || null
  const qtyRaw = Number(body.qty)
  const qty = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.floor(qtyRaw) : 1

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !slug) {
    return NextResponse.json({ ok: false })
  }

  const product = await db.product.findUnique({ where: { slug }, select: { id: true, name: true } })
  if (!product) return NextResponse.json({ ok: false })

  await db.priceRequest.create({
    data: {
      productId: product.id,
      guestName: name,
      guestEmail: email,
      qty,
      message: company ? `${message ? message + '\n\n' : ''}Company: ${company}` : message,
      status: 'OPEN',
    },
  })

  after(async () => {
    await notify(email, 'price-request-received', { name, product: product.name })
    await notifyStaff('staff-new-price-request', {
      product: product.name,
      who: company || name,
      qty: String(qty),
      link: `${appUrl()}/staff/price-requests`,
    })
    await createNotification({ kind: 'PRICE', title: `Price request — ${product.name}`, body: `${company || name} · qty ${qty}`, link: '/staff/price-requests', entity: 'PriceRequest' })
  })

  return NextResponse.json({ ok: true })
}
