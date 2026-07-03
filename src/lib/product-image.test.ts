import { describe, expect, it } from 'vitest'
import { productImageUrl } from './product-image'

describe('productImageUrl', () => {
  it('prefixes bare filenames with the public path', () => {
    expect(productImageUrl('Beaker.png')).toBe('/images/products/Beaker.png')
  })
  it('passes through full URLs (Supabase Storage uploads)', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/product-images/a.png'
    expect(productImageUrl(url)).toBe(url)
  })
  it('returns null for empty/nullish', () => {
    expect(productImageUrl(null)).toBeNull()
    expect(productImageUrl('')).toBeNull()
    expect(productImageUrl(undefined)).toBeNull()
  })
})
