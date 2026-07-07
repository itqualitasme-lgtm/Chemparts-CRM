'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { canAddToCart } from '@/lib/price'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import { nextEnquiryNo } from '@/lib/enquiry-no'
import {
  ensureCart,
  getCart,
  getCartCount,
  getCartIdOrNull,
  type CartActionState,
  type SubmitEnquiryState,
} from '@/lib/cart'

// Cart mutations as Server Actions. This is a top-level 'use server' module, so
// its exported async functions can be imported directly by client components
// (AddToCart / CartLineControls / EnquiryForm). Only async functions may be
// exported here — shared types live in ./cart.ts and are imported as types.
// Non-exported helpers below are ordinary server code and are allowed.

/** Revalidate every store surface a cart mutation can affect. */
function revalidateStore(): void {
  revalidatePath('/cart')
  revalidatePath('/products')
  revalidatePath('/products/instruments')
  revalidatePath('/products/consumables')
  revalidatePath('/products/spare-parts')
}

/**
 * Add a product to the cart. Only cart-eligible products (listed + fresh,
 * CART_ENABLED, in stock) are accepted. Upserts the CartItem on the unique
 * [cartId, productId], incrementing qty on conflict, and snapshots the unit
 * price from the current listPrice.
 */
export async function addToCart(productId: string, qty = 1): Promise<CartActionState> {
  const q = Number.isFinite(qty) && qty >= 1 ? Math.floor(qty) : 1

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      priceMode: true,
      listPrice: true,
      currency: true,
      priceUpdatedAt: true,
      saleMode: true,
      stockStatus: true,
    },
  })
  if (!product) return { error: 'This product is no longer available.' }

  const eligible = canAddToCart({
    priceMode: product.priceMode,
    listPrice: product.listPrice == null ? null : Number(product.listPrice),
    currency: product.currency,
    priceUpdatedAt: product.priceUpdatedAt,
    saleMode: product.saleMode,
    stockStatus: product.stockStatus,
  })
  if (!eligible) {
    return { error: 'This item is not available for direct add-to-cart — request a price instead.' }
  }

  const cartId = await ensureCart()

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId, productId: product.id } },
    create: {
      cartId,
      productId: product.id,
      qty: q,
      quoteOnly: false,
      unitPriceSnapshot: product.listPrice,
    },
    update: { qty: { increment: q } },
  })

  revalidateStore()
  const count = await getCartCount()
  return { ok: true, count }
}

/**
 * Add ANY active product to the cart as a quote-only line (no price commitment).
 * Used for equipment and other enquiry-only items so the customer can collect a
 * mixed basket and request a single quotation. Priced spares/consumables can
 * also be added this way; they simply carry their snapshot price.
 */
export async function addToQuote(productId: string, qty = 1): Promise<CartActionState> {
  const q = Number.isFinite(qty) && qty >= 1 ? Math.floor(qty) : 1

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, active: true, listPrice: true, priceMode: true },
  })
  if (!product || !product.active) return { error: 'This product is no longer available.' }

  const cartId = await ensureCart()

  // quoteOnly unless the product carries a confirmed public price.
  const priced = product.priceMode === 'LISTED' && product.listPrice != null

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId, productId: product.id } },
    create: {
      cartId,
      productId: product.id,
      qty: q,
      quoteOnly: !priced,
      unitPriceSnapshot: priced ? product.listPrice : null,
    },
    update: { qty: { increment: q } },
  })

  revalidateStore()
  return { ok: true, count: await getCartCount() }
}

/** Set an exact quantity for a cart line (min 1). Removes it if qty <= 0. */
export async function updateQty(itemId: string, qty: number): Promise<CartActionState> {
  const cartId = await getCartIdOrNull()
  if (!cartId) return { error: 'Your cart could not be found.' }

  const item = await db.cartItem.findUnique({ where: { id: itemId }, select: { id: true, cartId: true } })
  if (!item || item.cartId !== cartId) return { error: 'Item not found in your cart.' }

  const q = Math.floor(qty)
  if (!Number.isFinite(q) || q <= 0) {
    await db.cartItem.delete({ where: { id: itemId } })
  } else {
    await db.cartItem.update({ where: { id: itemId }, data: { qty: q } })
  }

  revalidateStore()
  return { ok: true, count: await getCartCount() }
}

/** Remove a single line from the cart. */
export async function removeItem(itemId: string): Promise<CartActionState> {
  const cartId = await getCartIdOrNull()
  if (!cartId) return { error: 'Your cart could not be found.' }

  const item = await db.cartItem.findUnique({ where: { id: itemId }, select: { id: true, cartId: true } })
  if (!item || item.cartId !== cartId) return { error: 'Item not found in your cart.' }

  await db.cartItem.delete({ where: { id: itemId } })

  revalidateStore()
  return { ok: true, count: await getCartCount() }
}

/**
 * Submit the current cart as an Enquiry (no payment). Members attach
 * customerId/createdByProfile; guests must supply name + email. Snapshots each
 * cart line into an EnquiryItem, then clears the cart. Returns the enquiryNo.
 */
export async function submitEnquiry(formData: FormData): Promise<SubmitEnquiryState> {
  const cart = await getCart()
  if (cart.lines.length === 0) {
    return { error: 'Your cart is empty.' }
  }

  const user = await getSessionUser()
  const message = (formData.get('message') as string | null)?.trim() || null

  let guestName: string | null = null
  let guestEmail: string | null = null
  let guestCompany: string | null = null
  let guestPhone: string | null = null

  if (!user) {
    guestName = (formData.get('guestName') as string | null)?.trim() || null
    guestEmail = (formData.get('guestEmail') as string | null)?.trim() || null
    guestCompany = (formData.get('guestCompany') as string | null)?.trim() || null
    guestPhone = (formData.get('guestPhone') as string | null)?.trim() || null
    if (!guestName || !guestEmail) {
      return { error: 'Please enter your name and email so we can reply.' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return { error: 'Please enter a valid email address.' }
    }
  }

  const enquiryNo = await nextEnquiryNo()

  await db.enquiry.create({
    data: {
      enquiryNo,
      customerId: user?.customerId ?? null,
      createdByProfile: user?.id ?? null,
      guestName,
      guestEmail,
      guestCompany,
      guestPhone,
      message,
      status: 'NEW',
      items: {
        create: cart.lines.map((l) => ({
          productId: l.productId,
          productName: l.name,
          qty: l.qty,
          priceRequested: false,
          note: null,
        })),
      },
    },
  })

  // Clear the cart's items (keep the cart row so the cookie stays valid).
  if (cart.id) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } })
  }

  // Confirm to the requester + notify staff, after the response (non-blocking).
  const to = user?.email ?? guestEmail
  const who = guestCompany || guestName || user?.fullName || 'A customer'
  after(async () => {
    await notify(to, 'enquiry-received', {
      name: user?.fullName || guestName || 'there',
      enquiryNo,
      itemCount: String(cart.lines.length),
    })
    await notifyStaff('staff-new-enquiry', {
      enquiryNo,
      who,
      channel: 'website cart',
      summary: `${cart.lines.length} item${cart.lines.length === 1 ? '' : 's'}${message ? ` · ${message}` : ''}`.slice(0, 220),
      link: `${appUrl()}/staff/enquiries`,
    })
    await createNotification({ kind: 'ENQUIRY', title: `New enquiry ${enquiryNo}`, body: `${who} · cart (${cart.lines.length} item${cart.lines.length === 1 ? '' : 's'})`, link: '/staff/enquiries', entity: 'Enquiry' })
  })

  revalidateStore()
  return { ok: true, enquiryNo }
}
