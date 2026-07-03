import { describe, expect, it } from 'vitest'
import { canAccessPortal, homePathFor, portalFromPath } from './rbac'

describe('portalFromPath', () => {
  it('maps paths to portals', () => {
    expect(portalFromPath('/staff/quotes')).toBe('staff')
    expect(portalFromPath('/admin')).toBe('admin')
    expect(portalFromPath('/vendor/bills')).toBe('vendor')
    expect(portalFromPath('/account/orders')).toBe('store')
    expect(portalFromPath('/products')).toBe(null) // public
  })
})

describe('canAccessPortal', () => {
  it('admin can access every portal', () => {
    for (const p of ['store', 'staff', 'vendor', 'admin'] as const)
      expect(canAccessPortal('ADMIN', p)).toBe(true)
  })
  it('staff can access staff but not admin or vendor', () => {
    expect(canAccessPortal('STAFF', 'staff')).toBe(true)
    expect(canAccessPortal('STAFF', 'admin')).toBe(false)
    expect(canAccessPortal('STAFF', 'vendor')).toBe(false)
  })
  it('customer only store, vendor only vendor', () => {
    expect(canAccessPortal('CUSTOMER', 'store')).toBe(true)
    expect(canAccessPortal('CUSTOMER', 'staff')).toBe(false)
    expect(canAccessPortal('VENDOR', 'vendor')).toBe(true)
    expect(canAccessPortal('VENDOR', 'store')).toBe(false)
  })
})

describe('homePathFor', () => {
  it('routes each role to its dashboard', () => {
    expect(homePathFor('ADMIN')).toBe('/admin')
    expect(homePathFor('STAFF')).toBe('/staff')
    expect(homePathFor('VENDOR')).toBe('/vendor')
    expect(homePathFor('CUSTOMER')).toBe('/account')
  })
})
