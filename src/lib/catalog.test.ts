import { describe, expect, it } from 'vitest'
import { getBrands, getProduct, getProducts } from './catalog'

describe('getProducts', () => {
  it('returns the full catalog by default', () => {
    const all = getProducts({})
    expect(all.length).toBeGreaterThan(100)
  })
  it('filters by brand', () => {
    const tanaka = getProducts({ brand: 'Tanaka' })
    expect(tanaka.length).toBeGreaterThan(0)
    expect(tanaka.every((p) => p.brand === 'Tanaka')).toBe(true)
  })
  it('filters by industry', () => {
    const petro = getProducts({ industry: 'petroleum' })
    expect(petro.length).toBeGreaterThan(0)
    expect(petro.every((p) => p.industries.includes('petroleum'))).toBe(true)
  })
  it('searches name, brand and standards case-insensitively', () => {
    const hits = getProducts({ q: 'distillation' })
    expect(hits.length).toBeGreaterThan(0)
    const brandHits = getProducts({ q: 'hitachi' })
    expect(brandHits.length).toBeGreaterThan(0)
  })
  it('combines filters', () => {
    const hits = getProducts({ brand: 'Tanaka', q: 'flash' })
    expect(hits.every((p) => p.brand === 'Tanaka')).toBe(true)
  })
})

describe('getProduct', () => {
  it('returns a product by slug with specs', () => {
    const first = getProducts({})[0]
    const p = getProduct(first.slug)
    expect(p?.name).toBe(first.name)
    expect(p?.specs).toBeTruthy()
  })
  it('returns null for unknown slug', () => {
    expect(getProduct('does-not-exist')).toBeNull()
  })
})

describe('getBrands', () => {
  it('returns sorted brands with counts', () => {
    const brands = getBrands()
    expect(brands.length).toBeGreaterThan(10)
    expect(brands.every((b) => b.count > 0)).toBe(true)
    const names = brands.map((b) => b.name)
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names)
  })
})
