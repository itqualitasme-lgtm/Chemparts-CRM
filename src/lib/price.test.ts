import { describe, it, expect } from 'vitest'
import { priceState, canAddToCart, PRICE_STALE_DAYS } from './price'

const NOW = new Date('2026-07-04T12:00:00.000Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000)

describe('priceState', () => {
  it('is on_request when priceMode is ON_REQUEST (even with a price)', () => {
    const s = priceState(
      { priceMode: 'ON_REQUEST', listPrice: 100, currency: 'AED', priceUpdatedAt: NOW },
      NOW,
    )
    expect(s).toEqual({ mode: 'on_request', price: null, currency: 'AED', stale: false })
  })

  it('is on_request when there is no list price, even if LISTED', () => {
    const s = priceState(
      { priceMode: 'LISTED', listPrice: null, currency: 'AED', priceUpdatedAt: NOW },
      NOW,
    )
    expect(s.mode).toBe('on_request')
    expect(s.price).toBeNull()
  })

  it('is indicative when explicitly INDICATIVE, keeping the price', () => {
    const s = priceState(
      { priceMode: 'INDICATIVE', listPrice: 18.5, currency: 'AED', priceUpdatedAt: NOW },
      NOW,
    )
    expect(s).toEqual({ mode: 'indicative', price: 18.5, currency: 'AED', stale: true })
  })

  it('is indicative when a LISTED price is stale (older than 30 days)', () => {
    const s = priceState(
      { priceMode: 'LISTED', listPrice: 200, currency: 'USD', priceUpdatedAt: daysAgo(31) },
      NOW,
    )
    expect(s.mode).toBe('indicative')
    expect(s.price).toBe(200)
    expect(s.stale).toBe(true)
  })

  it('is indicative when a LISTED price has no priceUpdatedAt', () => {
    const s = priceState(
      { priceMode: 'LISTED', listPrice: 200, currency: 'AED', priceUpdatedAt: null },
      NOW,
    )
    expect(s.mode).toBe('indicative')
    expect(s.stale).toBe(true)
  })

  it('is listed when a LISTED price is fresh', () => {
    const s = priceState(
      { priceMode: 'LISTED', listPrice: 18.5, currency: 'AED', priceUpdatedAt: daysAgo(1) },
      NOW,
    )
    expect(s).toEqual({ mode: 'listed', price: 18.5, currency: 'AED', stale: false })
  })

  it('is listed exactly at the 30-day boundary (not yet past the threshold)', () => {
    const s = priceState(
      { priceMode: 'LISTED', listPrice: 50, currency: 'AED', priceUpdatedAt: daysAgo(PRICE_STALE_DAYS) },
      NOW,
    )
    expect(s.mode).toBe('listed')
    expect(s.stale).toBe(false)
  })

  it('becomes indicative just past the 30-day boundary', () => {
    const justPast = new Date(daysAgo(PRICE_STALE_DAYS).getTime() - 1)
    const s = priceState(
      { priceMode: 'LISTED', listPrice: 50, currency: 'AED', priceUpdatedAt: justPast },
      NOW,
    )
    expect(s.mode).toBe('indicative')
    expect(s.stale).toBe(true)
  })
})

describe('canAddToCart', () => {
  const fresh = { priceMode: 'LISTED', listPrice: 18.5, currency: 'AED', priceUpdatedAt: daysAgo(1) }

  it('is true for a fresh LISTED, cart-enabled, in-stock product', () => {
    expect(canAddToCart({ ...fresh, saleMode: 'CART_ENABLED', stockStatus: 'IN_STOCK' }, NOW)).toBe(true)
  })

  it('is false when quote-only', () => {
    expect(canAddToCart({ ...fresh, saleMode: 'QUOTE_ONLY', stockStatus: 'IN_STOCK' }, NOW)).toBe(false)
  })

  it('is false when out of stock', () => {
    expect(canAddToCart({ ...fresh, saleMode: 'CART_ENABLED', stockStatus: 'OUT_OF_STOCK' }, NOW)).toBe(false)
  })

  it('is false when the price is stale (indicative)', () => {
    expect(
      canAddToCart(
        { priceMode: 'LISTED', listPrice: 18.5, currency: 'AED', priceUpdatedAt: daysAgo(60), saleMode: 'CART_ENABLED', stockStatus: 'IN_STOCK' },
        NOW,
      ),
    ).toBe(false)
  })

  it('is false when on request', () => {
    expect(
      canAddToCart(
        { priceMode: 'ON_REQUEST', listPrice: null, currency: 'AED', priceUpdatedAt: null, saleMode: 'CART_ENABLED', stockStatus: 'IN_STOCK' },
        NOW,
      ),
    ).toBe(false)
  })
})
