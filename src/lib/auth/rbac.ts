export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER' | 'VENDOR'
export type Portal = 'store' | 'staff' | 'vendor' | 'admin'

/** Protected-path prefixes → portal. Public store pages return null. */
export function portalFromPath(pathname: string): Portal | null {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
  if (pathname === '/vendor' || pathname.startsWith('/vendor/')) return 'vendor'
  if (pathname === '/account' || pathname.startsWith('/account/')) return 'store'
  return null
}

const ACCESS: Record<Role, Portal[]> = {
  ADMIN: ['store', 'staff', 'vendor', 'admin'],
  STAFF: ['store', 'staff'],
  CUSTOMER: ['store'],
  VENDOR: ['vendor'],
}

export function canAccessPortal(role: Role, portal: Portal): boolean {
  return ACCESS[role].includes(portal)
}

export function homePathFor(role: Role): string {
  return { ADMIN: '/admin', STAFF: '/staff', VENDOR: '/vendor', CUSTOMER: '/account' }[role]
}
