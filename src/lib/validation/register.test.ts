import { describe, expect, it } from 'vitest'
import { registerSchema } from './register'

const valid = {
  fullName: 'Ali Hassan',
  companyName: 'Gulf Labs LLC',
  email: 'ali@gulflabs.com',
  phone: '+97455512345',
  country: 'QA',
  password: 'Str0ng-password',
}

describe('registerSchema', () => {
  it('accepts a valid global registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects bad email, short password, missing country', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, country: '' }).success).toBe(false)
  })
  it('rejects phone without country code', () => {
    expect(registerSchema.safeParse({ ...valid, phone: '055123456' }).success).toBe(false)
  })
})
