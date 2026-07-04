import 'server-only'

import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { productImageUrl } from '@/lib/product-image'

// Server-only cart layer: identity, reads, and shared helpers. The mutating
// server ACTIONS (addToCart / updateQty / removeItem / submitEnquiry) live in
// ./cart-actions.ts — a 'use server' module — because client components can only
// import Server Actions from a top-level 'use server' file, not from a module
// that uses per-function inline 'use server' directives. This file exposes the
// helpers those actions need (ensureCart, getCartIdOrNull, getCart, getCartCount)
// plus the read paths used directly by Server Components (cart page, header).
//
// Cart identity works two ways:
//  - Guests get an httpOnly `cp_cart` cookie holding a random token; the Cart row
//    is keyed by that token.
//  - Logged-in members: the cart is keyed by their customerId (and we stamp
//    profileId). If they had a guest cart, we adopt it on the next ensureCart().
//
// IMPORTANT: cookies can only be *set* inside a Server Action or Route Handler,
// never during a Server Component render. So ensureCart() (called from actions)
// may set the cookie, while the read-only getCartIdOrNull()/getCartCount() only
// read the existing cookie and never write.

const CART_COOKIE = 'cp_cart'
const ONE_YEAR = 60 * 60 * 24 * 365

/** Read the cart token from the cookie, or null if none is set. */
async function readCartToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value ?? null
}

/**
 * Resolve (creating if needed) the current cart and return its id. Safe to call
 * only from a Server Action / Route Handler because it may set the cookie.
 *
 * - Member: find-or-create a cart by customerId; if a guest cart exists under
 *   the cookie token, adopt it (link customerId/profileId) rather than orphan it.
 * - Guest: find-or-create a cart by the cookie token, generating one if absent.
 */
export async function ensureCart(): Promise<string> {
  const store = await cookies()
  const token = store.get(CART_COOKIE)?.value ?? null
  const user = await getSessionUser()

  if (user?.customerId) {
    // If there is a guest cart under the cookie token, adopt it for this member.
    if (token) {
      const guestCart = await db.cart.findUnique({ where: { token }, select: { id: true, customerId: true } })
      if (guestCart && !guestCart.customerId) {
        // Is there already a member cart? If so, merge guest items into it.
        const memberCart = await db.cart.findFirst({
          where: { customerId: user.customerId },
          select: { id: true },
        })
        if (memberCart && memberCart.id !== guestCart.id) {
          await mergeCarts(guestCart.id, memberCart.id)
          await db.cart.delete({ where: { id: guestCart.id } })
          return memberCart.id
        }
        // No member cart yet — promote the guest cart in place.
        await db.cart.update({
          where: { id: guestCart.id },
          data: { customerId: user.customerId, profileId: user.id },
        })
        return guestCart.id
      }
    }

    const existing = await db.cart.findFirst({ where: { customerId: user.customerId }, select: { id: true } })
    if (existing) return existing.id

    const created = await db.cart.create({
      data: { customerId: user.customerId, profileId: user.id },
      select: { id: true },
    })
    return created.id
  }

  // Guest path.
  if (token) {
    const cart = await db.cart.findUnique({ where: { token }, select: { id: true } })
    if (cart) return cart.id
  }

  const newToken = randomUUID()
  const created = await db.cart.create({ data: { token: newToken }, select: { id: true } })
  store.set(CART_COOKIE, newToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
    secure: process.env.NODE_ENV === 'production',
  })
  return created.id
}

/** Move a source cart's items into a target cart (increment qty on conflict). */
async function mergeCarts(sourceCartId: string, targetCartId: string): Promise<void> {
  const items = await db.cartItem.findMany({ where: { cartId: sourceCartId } })
  for (const it of items) {
    const existing = await db.cartItem.findUnique({
      where: { cartId_productId: { cartId: targetCartId, productId: it.productId } },
      select: { id: true, qty: true },
    })
    if (existing) {
      await db.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + it.qty } })
    } else {
      await db.cartItem.create({
        data: {
          cartId: targetCartId,
          productId: it.productId,
          qty: it.qty,
          quoteOnly: it.quoteOnly,
          unitPriceSnapshot: it.unitPriceSnapshot,
        },
      })
    }
  }
}

/**
 * Read-only cart lookup for Server Components and actions. Never sets a cookie,
 * so it is safe during render. Returns the current cart id or null if none yet.
 */
export async function getCartIdOrNull(): Promise<string | null> {
  const user = await getSessionUser()
  if (user?.customerId) {
    const cart = await db.cart.findFirst({ where: { customerId: user.customerId }, select: { id: true } })
    if (cart) return cart.id
  }
  const token = await readCartToken()
  if (!token) return null
  const cart = await db.cart.findUnique({ where: { token }, select: { id: true } })
  return cart?.id ?? null
}

// ---------------------------------------------------------------------------
// Shared action-return types (imported as types by ./cart-actions.ts; a
// 'use server' module cannot export types itself, so they live here).
// ---------------------------------------------------------------------------

export type CartActionState = { ok?: boolean; error?: string; count?: number }
export type SubmitEnquiryState = { ok?: boolean; error?: string; enquiryNo?: string }

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type CartLine = {
  id: string
  productId: string
  slug: string
  name: string
  brand: string
  image: string | null
  qty: number
  unitPrice: number | null
  currency: string
  priceMode: 'LISTED' | 'INDICATIVE' | 'ON_REQUEST'
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER'
  lineTotal: number | null
}

export type CartView = {
  id: string | null
  lines: CartLine[]
  subtotal: number
  currency: string
  count: number
}

/** Full cart with product info, per-line totals, subtotal (priced lines) + count. */
export async function getCart(): Promise<CartView> {
  const cartId = await getCartIdOrNull()
  if (!cartId) return { id: null, lines: [], subtotal: 0, currency: 'AED', count: 0 }

  const items = await db.cartItem.findMany({
    where: { cartId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      qty: true,
      productId: true,
      product: {
        select: {
          slug: true,
          name: true,
          image: true,
          listPrice: true,
          currency: true,
          priceMode: true,
          stockStatus: true,
          brand: { select: { name: true } },
        },
      },
    },
  })

  let subtotal = 0
  let currency = 'AED'
  const lines: CartLine[] = items.map((it) => {
    const unitPrice = it.product.listPrice == null ? null : Number(it.product.listPrice)
    const lineTotal = unitPrice == null ? null : unitPrice * it.qty
    if (lineTotal != null) {
      subtotal += lineTotal
      currency = it.product.currency
    }
    return {
      id: it.id,
      productId: it.productId,
      slug: it.product.slug,
      name: it.product.name,
      brand: it.product.brand.name,
      image: productImageUrl(it.product.image),
      qty: it.qty,
      unitPrice,
      currency: it.product.currency,
      priceMode: it.product.priceMode,
      stockStatus: it.product.stockStatus,
      lineTotal,
    }
  })

  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  return { id: cartId, lines, subtotal, currency, count }
}

/** Total item count for the header badge. Read-only, safe in Server Components. */
export async function getCartCount(): Promise<number> {
  const cartId = await getCartIdOrNull()
  if (!cartId) return 0
  const agg = await db.cartItem.aggregate({ where: { cartId }, _sum: { qty: true } })
  return agg._sum.qty ?? 0
}
