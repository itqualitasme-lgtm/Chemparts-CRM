import { describe, expect, it } from 'vitest'
import { productSchema, splitList } from './product'

const base = {
  name: 'Flash Point Tester',
  brandId: 'brand123',
  type: 'EQUIPMENT',
  desc: 'Automatic flash point tester',
  currency: 'AED',
}

describe('productSchema', () => {
  it('accepts a valid equipment product', () => {
    expect(productSchema.safeParse(base).success).toBe(true)
  })
  it('requires name, brand, desc', () => {
    expect(productSchema.safeParse({ ...base, name: '' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, brandId: '' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, desc: '' }).success).toBe(false)
  })
  it('rejects an invalid type', () => {
    expect(productSchema.safeParse({ ...base, type: 'WIDGET' }).success).toBe(false)
  })
  it('parses an optional price to a number, empty to null', () => {
    const withPrice = productSchema.parse({ ...base, type: 'CONSUMABLE', listPrice: '49.50' })
    expect(withPrice.listPrice).toBe(49.5)
    const noPrice = productSchema.parse({ ...base, listPrice: '' })
    expect(noPrice.listPrice).toBeNull()
  })
  it('rejects a negative or non-numeric price', () => {
    expect(productSchema.safeParse({ ...base, listPrice: '-5' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, listPrice: 'abc' }).success).toBe(false)
  })
})

describe('splitList', () => {
  it('splits, trims, dedupes', () => {
    expect(splitList('ASTM, ISO ,ASTM\nIP')).toEqual(['ASTM', 'ISO', 'IP'])
  })
  it('returns [] for empty', () => {
    expect(splitList('')).toEqual([])
    expect(splitList(null)).toEqual([])
  })
})
