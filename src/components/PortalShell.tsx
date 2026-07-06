import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import PortalMenu from '@/components/PortalMenu'
import PortalNavList, { type NavGroup } from '@/components/PortalNavList'
import type { SessionUser } from '@/lib/auth/session'
import type { Portal } from '@/lib/auth/rbac'

type NavItem = { href: string; label: string }

// Customer store portal — flat, small (desktop top nav + mobile bottom tabs).
const STORE_NAV: NavItem[] = [
  { href: '/account', label: 'Overview' },
  { href: '/products', label: 'Store' },
  { href: '/account/enquiries', label: 'Enquiries' },
  { href: '/account/quotations', label: 'Quotations' },
  { href: '/account/orders', label: 'Orders' },
]

// Staff/vendor/admin — grouped into a slide-in drawer menu.
const SALES_ITEMS: NavItem[] = [
  { href: '/staff/enquiries', label: 'Enquiries' },
  { href: '/staff/quotations', label: 'Quotations' },
  { href: '/staff/orders', label: 'Orders' },
  { href: '/staff/service-requests', label: 'Service requests' },
  { href: '/staff/price-requests', label: 'Price requests' },
  { href: '/staff/customers', label: 'Customers' },
  { href: '/staff/sales-people', label: 'Sales people' },
]
const CATALOG_ITEMS: NavItem[] = [
  { href: '/staff/products', label: 'Products' },
  { href: '/staff/brands', label: 'Brands' },
  { href: '/staff/stock', label: 'Stock' },
]

const GROUPS: Record<'staff' | 'vendor' | 'admin', NavGroup[]> = {
  staff: [
    { items: [{ href: '/staff', label: 'Dashboard' }] },
    { title: 'Sales', items: SALES_ITEMS },
    { title: 'Catalog', items: CATALOG_ITEMS },
  ],
  vendor: [
    { items: [{ href: '/vendor', label: 'Overview' }] },
    {
      title: 'Purchasing',
      items: [
        { href: '/vendor/purchase-orders', label: 'Purchase orders' },
        { href: '/vendor/bills', label: 'Bills' },
      ],
    },
  ],
  admin: [
    { items: [{ href: '/admin', label: 'Dashboard' }] },
    { title: 'Sales', items: SALES_ITEMS },
    { title: 'Catalog', items: CATALOG_ITEMS },
    {
      title: 'Administration',
      items: [
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/settings', label: 'Settings' },
        { href: '/admin/reports', label: 'Reports' },
      ],
    },
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
  const isCustomer = portal === 'store'
  // Admins see one comprehensive menu everywhere (they can reach every tool),
  // so the drawer stays consistent when they open a staff-area module.
  const groups: NavGroup[] = isCustomer
    ? []
    : user.role === 'ADMIN'
      ? GROUPS.admin
      : GROUPS[portal as 'staff' | 'vendor']

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#0A2540] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {!isCustomer && <PortalMenu groups={groups} label={PORTAL_LABEL[portal]} />}
            <Link href="/" className="flex items-center gap-2.5" aria-label="Chemparts — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/logo.svg" alt="Chemparts" width={40} height={20} className="h-5 w-auto" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-[0.2em]">CHEMPARTS</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-300">{PORTAL_LABEL[portal]}</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-200 sm:block">{user.fullName}</span>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin/settings"
                className="rounded border border-white/30 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10"
              >
                Settings
              </Link>
            )}
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
            {STORE_NAV.map((item) => (
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
          <aside className="sticky top-14 hidden max-h-[calc(100dvh-3.5rem)] w-60 shrink-0 self-start overflow-y-auto border-r border-slate-200 bg-white p-3 md:block">
            <PortalNavList groups={groups} />
          </aside>
        )}
        <main className={`min-w-0 flex-1 p-4 md:p-8 ${isCustomer ? 'pb-24 md:pb-8' : ''}`}>{children}</main>
      </div>

      {/* Staff/vendor/admin navigate via the drawer in the header. Customer keeps
          its desktop top nav + mobile bottom tabs. */}
      {isCustomer && (
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
          {STORE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 py-3 text-center text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
