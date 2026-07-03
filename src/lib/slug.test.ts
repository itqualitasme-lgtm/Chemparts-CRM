import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Flash Point Tester')).toBe('flash-point-tester')
  })
  it('strips punctuation and collapses separators', () => {
    expect(slugify('ACO-8 (Open Cup)!')).toBe('aco-8-open-cup')
  })
  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --Hello--  ')).toBe('hello')
  })
  it('removes diacritics', () => {
    expect(slugify('Côte dÎvoire')).toBe('cote-divoire')
  })
})
