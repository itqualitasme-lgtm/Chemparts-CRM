import { describe, expect, it } from 'vitest'
import { filterProducts, type CatalogProduct } from './catalog-filter'

const p = (over: Partial<CatalogProduct>): CatalogProduct => ({
  slug: 's', name: 'Name', brand: 'Tanaka', type: 'EQUIPMENT', featured: false,
  image: null, images: [], desc: '', industries: [], testTypes: [], specs: {},
  standards: [], overview: '', listPrice: null, currency: 'AED', ...over,
})

const items: CatalogProduct[] = [
  p({ slug: 'a', name: 'Flash Point Tester', brand: 'Tanaka', industries: ['petroleum'], standards: ['ASTM'], type: 'EQUIPMENT' }),
  p({ slug: 'b', name: 'Distillation Analyzer', brand: 'Hitachi', industries: ['petroleum', 'refineries'], testTypes: ['distillation'], type: 'EQUIPMENT' }),
  p({ slug: 'c', name: 'Glass Beaker Set', brand: 'Normalab', industries: [], type: 'CONSUMABLE' }),
]

describe('filterProducts', () => {
  it('returns all with empty filter', () => {
    expect(filterProducts(items, {})).toHaveLength(3)
  })
  it('filters by brand', () => {
    expect(filterProducts(items, { brand: 'Tanaka' }).map((x) => x.slug)).toEqual(['a'])
  })
  it('filters by industry', () => {
    expect(filterProducts(items, { industry: 'refineries' }).map((x) => x.slug)).toEqual(['b'])
  })
  it('filters by type', () => {
    expect(filterProducts(items, { type: 'CONSUMABLE' }).map((x) => x.slug)).toEqual(['c'])
  })
  it('searches name, brand, standards, testTypes case-insensitively', () => {
    expect(filterProducts(items, { q: 'distillation' }).map((x) => x.slug)).toEqual(['b'])
    expect(filterProducts(items, { q: 'hitachi' }).map((x) => x.slug)).toEqual(['b'])
    expect(filterProducts(items, { q: 'astm' }).map((x) => x.slug)).toEqual(['a'])
  })
  it('combines filters', () => {
    expect(filterProducts(items, { brand: 'Tanaka', q: 'flash' }).map((x) => x.slug)).toEqual(['a'])
  })
})
