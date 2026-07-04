import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import type { SessionUser } from '@/lib/auth/session'
import type { Portal } from '@/lib/auth/rbac'

type NavItem = { href: string; label: string }

const NAV: Record<Portal, NavItem[]> = {
  store: [
    { href: '/account', label: 'Overview' },
    { href: '/products', label: 'Store' },
    { href: '/account/enquiries', label: 'Enquiries' },
    { href: '/account/quotations', label: 'Quotations' },
    { href: '/account/orders', label: 'Orders' },
  ],
  staff: [
    { href: '/staff', label: 'Dashboard' },
    { href: '/staff/enquiries', label: 'Enquiries' },
    { href: '/staff/quotations', label: 'Quotations' },
    { href: '/staff/orders', label: 'Orders' },
    { href: '/staff/price-requests', label: 'Price requests' },
    { href: '/staff/products', label: 'Products' },
    { href: '/staff/brands', label: 'Brands' },
    { href: '/staff/customers', label: 'Customers' },
    { href: '/staff/stock', label: 'Stock' },
  ],
  vendor: [
    { href: '/vendor', label: 'Overview' },
    { href: '/vendor/purchase-orders', label: 'Purchase orders' },
    { href: '/vendor/bills', label: 'Bills' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/staff/products', label: 'Products' },
    { href: '/staff/brands', label: 'Brands' },
    { href: '/staff/customers', label: 'Customers' },
    { href: '/staff/enquiries', label: 'Enquiries' },
    { href: '/staff/quotations', label: 'Quotations' },
    { href: '/staff/orders', label: 'Orders' },
    { href: '/staff/price-requests', label: 'Price requests' },
    { href: '/staff/stock', label: 'Stock' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/reports', label: 'Reports' },
  ],
}

const PORTAL_LABEL: Record<Portal, string> = {
  store: 'My Account',
  staff: 'Staff Portal',
  vendor: 'Vendor Portal',
  admin: 'Administration',
}

export default function PortalShell({
  portal,
  user,
  children,
}: {
  portal: Portal
  user: SessionUser
  children: React.ReactNode
}) {
  // Admins see one comprehensive menu everywhere (they can reach every tool),
  // so the sidebar stays consistent when they open a staff-area module.
  const nav = user.role === 'ADMIN' ? NAV.admin : NAV[portal]
  const isCustomer = portal === 'store'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#0A2540] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Chemparts — home">
              <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
                <rect x="8" y="16" width="20" height="32" rx="3" fill="#ffffff" />
                <rect x="36" y="16" width="20" height="32" rx="3" fill="#35769e" />
                <text x="18" y="33" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20" fill="#0A2540" textAnchor="middle" dominantBaseline="central">C</text>
                <text x="46" y="33" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20" fill="#ffffff" textAnchor="middle" dominantBaseline="central">P</text>
              </svg>
              <span className="text-sm font-bold tracking-[0.2em]">CHEMPARTS</span>
            </Link>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-200">
              {PORTAL_LABEL[portal]}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-200 sm:block">{user.fullName}</span>
            <form action={logout}>
              <button className="rounded border border-white/30 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {isCustomer && (
        <nav className="hidden border-b border-slate-200 bg-white md:block">
          <div className="mx-auto flex max-w-6xl gap-1 px-4 py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        {!isCustomer && (
          <aside className="hidden w-52 shrink-0 border-r border-slate-200 bg-white py-6 md:block">
            <nav className="flex flex-col gap-1 px-3">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        <main className={`flex-1 p-4 md:p-8 ${isCustomer ? 'pb-20' : ''}`}>{children}</main>
      </div>

      {/* Customer: mobile-first bottom tabs. Staff/vendor/admin: top scroll nav on mobile */}
      {isCustomer ? (
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 py-3 text-center text-xs font-medium text-slate-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : (
        <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-slate-200 bg-white md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 px-4 py-3 text-center text-xs font-medium text-slate-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

    </div>
  )
}
