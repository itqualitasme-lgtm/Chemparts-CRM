'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'

export type RequestPriceState = { ok?: boolean; error?: string; needContact?: boolean }

/**
 * Customer (or guest) asks staff to confirm the current price of a product.
 * Creates an OPEN PriceRequest. If the requester is a logged-in customer we
 * attach customerId + requestedByProfile; otherwise name + email are required.
 *
 * Email is NOT sent here (deferred slice) — we just record a PENDING EmailLog
 * placeholder so the staff notification pipeline has something to pick up later.
 */
export async function requestPrice(
  productId: string,
  formData: FormData,
): Promise<RequestPriceState> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  })
  if (!product) return { error: 'This product is no longer available.' }

  const qtyRaw = Number(formData.get('qty'))
  const qty = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.floor(qtyRaw) : 1
  const message = (formData.get('message') as string | null)?.trim() || null

  const user = await getSessionUser()

  let guestName: string | null = null
  let guestEmail: string | null = null

  if (!user) {
    guestName = (formData.get('guestName') as string | null)?.trim() || null
    guestEmail = (formData.get('guestEmail') as string | null)?.trim() || null
    if (!guestName || !guestEmail) {
      // No session (e.g. it expired since the page loaded) and no contact info —
      // ask for name/email rather than silently failing.
      return { needContact: true, error: 'Please add your name and email so we can reply.' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return { error: 'Please enter a valid email address.' }
    }
  }

  await db.priceRequest.create({
    data: {
      productId: product.id,
      customerId: user?.customerId ?? null,
      requestedByProfile: user?.id ?? null,
      guestName,
      guestEmail,
      qty,
      message,
      status: 'OPEN',
    },
  })

  // Confirm to the requester + notify staff, after the response (non-blocking).
  const who = guestName || user?.fullName || 'A customer'
  after(async () => {
    await notify(user?.email ?? guestEmail, 'price-request-received', { name: guestName || user?.fullName || 'there', product: product.name })
    await notifyStaff('staff-new-price-request', {
      product: product.name,
      who,
      qty: String(qty),
      link: `${appUrl()}/staff/price-requests`,
    })
  })

  return { ok: true }
}
