// Pure, framework-free price-state logic. Shared by the store (section cards +
// product detail) and the staff price-requests queue. No DB, no server-only —
// so it's unit-testable in isolation (see price.test.ts).

/** A LISTED price is considered stale (needs re-confirmation) after this many days. */
export const PRICE_STALE_DAYS = 30

const STALE_MS = PRICE_STALE_DAYS * 24 * 60 * 60 * 1000

export type PriceState = {
  mode: 'listed' | 'indicative' | 'on_request'
  price: number | null
  currency: string
  stale: boolean
}

/** Minimal shape needed to compute price state — a subset of Product. */
export type PriceInput = {
  priceMode: string
  listPrice: number | null
  currency: string
  priceUpdatedAt: Date | null
  saleMode?: string
  stockStatus?: string
}

/**
 * Compute the effective display price state for a product.
 *
 * - `ON_REQUEST` (or no list price) → on_request, no number shown.
 * - `INDICATIVE`, or a LISTED price older than PRICE_STALE_DAYS → indicative:
 *   show the price but ask to confirm current price.
 * - `LISTED` and fresh → listed: show the price, orderable.
 */
export function priceState(p: PriceInput, now: Date = new Date()): PriceState {
  if (p.priceMode === 'ON_REQUEST' || p.listPrice == null) {
    return { mode: 'on_request', price: null, currency: p.currency, stale: false }
  }

  const stale = !p.priceUpdatedAt || now.getTime() - p.priceUpdatedAt.getTime() > STALE_MS

  if (p.priceMode === 'INDICATIVE' || stale) {
    return { mode: 'indicative', price: p.listPrice, currency: p.currency, stale: true }
  }

  return { mode: 'listed', price: p.listPrice, currency: p.currency, stale: false }
}

/**
 * Whether this product can actually go into the cart: only a fresh LISTED price,
 * on a cart-enabled product, that isn't out of stock. (The cart button is a
 * later slice; for now this just informs labels.)
 */
export function canAddToCart(p: PriceInput, now: Date = new Date()): boolean {
  const state = priceState(p, now)
  return state.mode === 'listed' && p.saleMode === 'CART_ENABLED' && p.stockStatus !== 'OUT_OF_STOCK'
}
