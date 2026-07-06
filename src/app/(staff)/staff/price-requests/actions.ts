'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { notify } from '@/lib/mail/notify'

export type RespondPriceState = { ok?: boolean; error?: string }

/**
 * Staff confirm the current price for a price request. This:
 *  - updates the Product (listPrice, currency, priceUpdatedAt=now, priceMode=LISTED)
 *  - writes a PriceHistory row (old → new, changedById = staff profile id)
 *  - updates the PriceRequest (quotedPrice/quotedCurrency/validUntil/status=QUOTED,
 *    respondedByProfile, respondedAt)
 *
 * Customer notification email is deferred — we only persist a PENDING EmailLog.
 */
export async function respondPrice(
  requestId: string,
  formData: FormData,
): Promise<RespondPriceState> {
  const user = await requirePortal('staff')

  const priceRaw = Number(formData.get('price'))
  if (!Number.isFinite(priceRaw) || priceRaw <= 0) {
    return { error: 'Enter a valid confirmed price.' }
  }
  const price = Math.round(priceRaw * 100) / 100
  const currency = ((formData.get('currency') as string | null)?.trim() || 'AED').toUpperCase()

  const validUntilRaw = (formData.get('validUntil') as string | null)?.trim()
  let validUntil: Date | null = null
  if (validUntilRaw) {
    const d = new Date(validUntilRaw)
    if (!Number.isNaN(d.getTime())) validUntil = d
  }

  const request = await db.priceRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      guestName: true,
      guestEmail: true,
      customer: { select: { companyName: true, email: true, contacts: { where: { isPrimary: true }, take: 1, select: { email: true } } } },
      product: { select: { id: true, name: true, listPrice: true, currency: true } },
    },
  })
  if (!request) return { error: 'Price request not found.' }
  if (request.status !== 'OPEN') return { error: 'This request has already been handled.' }

  const now = new Date()
  const oldPrice = request.product.listPrice

  await db.$transaction([
    db.product.update({
      where: { id: request.product.id },
      data: { listPrice: price, currency, priceUpdatedAt: now, priceMode: 'LISTED' },
    }),
    db.priceHistory.create({
      data: {
        productId: request.product.id,
        oldPrice: oldPrice ?? null,
        newPrice: price,
        currency,
        changedById: user.id,
        changedAt: now,
      },
    }),
    db.priceRequest.update({
      where: { id: request.id },
      data: {
        quotedPrice: price,
        quotedCurrency: currency,
        validUntil,
        status: 'QUOTED',
        respondedByProfile: user.id,
        respondedAt: now,
      },
    }),
  ])

  // Email the confirmed price to the customer (non-blocking).
  const to = request.guestEmail ?? request.customer?.email ?? request.customer?.contacts[0]?.email
  after(() =>
    notify(to, 'price-confirmed', {
      name: request.guestName ?? request.customer?.companyName ?? 'there',
      product: request.product.name,
      price: `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      validUntil: validUntil ? validUntil.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }),
  )

  revalidatePath('/staff/price-requests')
  revalidatePath('/products')
  revalidatePath('/products/instruments')
  revalidatePath('/products/consumables')
  revalidatePath('/products/spare-parts')

  return { ok: true }
}
