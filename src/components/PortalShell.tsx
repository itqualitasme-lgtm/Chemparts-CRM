import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import PortalMenu from '@/components/PortalMenu'
import PortalLogoLink from '@/components/PortalLogoLink'
import PortalNavList, { type NavGroup } from '@/components/PortalNavList'
import NotificationBell from '@/components/NotificationBell'
import { getNotifications, getUnreadCount } from '@/lib/notifications'
import { db } from '@/lib/db'
import type { SessionUser } from '@/lib/auth/session'
import type { Portal } from '@/lib/auth/rbac'

type NavItem = { href: string; label: string; badge?: number }

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
  { href: '/staff/chats', label: 'Chats' },
  { href: '/staff/quotations', label: 'Quotations' },
  { href: '/staff/orders', label: 'Orders' },
  { href: '/staff/service-requests', label: 'Service requests' },
  { href: '/staff/price-requests', label: 'Price requests' },
  { href: '/staff/customers', label: 'Customers' },
  { href: '/staff/sales-people', label: 'Sales people' },
  { href: '/staff/subscribers', label: 'Subscribers' },
  { href: '/staff/campaigns', label: 'Campaigns' },
]
const CATALOG_ITEMS: NavItem[] = [
  { href: '/staff/products', label: 'Products' },
  { href: '/staff/brands', label: 'Brands' },
  { href: '/staff/clients', label: 'Clients' },
  { href: '/staff/blog', label: 'Blog / news' },
  { href: '/staff/stock', label: 'Stock' },
]
const PURCHASING_ITEMS: NavItem[] = [
  { href: '/staff/purchase-orders', label: 'Purchase orders' },
  { href: '/staff/bills', label: 'Bills' },
]

const GROUPS: Record<'staff' | 'vendor' | 'admin', NavGroup[]> = {
  staff: [
    { items: [{ href: '/staff', label: 'Dashboard' }] },
    { title: 'Sales', items: SALES_ITEMS },
    { title: 'Catalog', items: CATALOG_ITEMS },
    { title: 'Purchasing', items: PURCHASING_ITEMS },
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
    { title: 'Purchasing', items: PURCHASING_ITEMS },
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

export default async function PortalShell({
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
  const baseGroups: NavGroup[] = isCustomer
    ? []
    : user.role === 'ADMIN'
      ? GROUPS.admin
      : GROUPS[portal as 'staff' | 'vendor']

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '?'

  // Staff/admin get the notification bell (shared team inbox) plus count badges
  // for work waiting on them: live chats and unanswered price requests.
  const [notifications, unread, chatsWaiting, priceRequestsOpen] = isCustomer
    ? [[], 0, 0, 0]
    : await Promise.all([
        getNotifications(),
        getUnreadCount(),
        db.chatConversation.count({ where: { status: 'LIVE' } }),
        db.priceRequest.count({ where: { status: 'OPEN' } }),
      ])

  const BADGES: Record<string, number> = {
    '/staff/chats': chatsWaiting,
    '/staff/price-requests': priceRequestsOpen,
  }
  const groups: NavGroup[] = baseGroups.map((g) => ({
    ...g,
    items: g.items.map((it) => (BADGES[it.href] ? { ...it, badge: BADGES[it.href] } : it)),
  }))
  const bellItems = notifications.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    readByName: n.readByName,
    createdAt: n.createdAt.toISOString(),
  }))

  // Customer store portal keeps its top-bar + bottom-tabs layout.
  if (isCustomer) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="portal-dark sticky top-0 z-20 border-b border-black/10 bg-[#0A2540] text-white">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-3 sm:px-4">
            <PortalLogoLink label={PORTAL_LABEL[portal]} />
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white ring-1 ring-white/20">{initial}</span>
              <div className="hidden leading-tight sm:block">
                <div className="text-xs font-medium text-white">{user.fullName}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-300">{user.role.toLowerCase()}</div>
              </div>
              <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />
              <form action={logout}>
                <button className="rounded-md border border-white/25 px-2.5 py-1 text-xs font-medium text-slate-100 transition hover:bg-white/10">Sign out</button>
              </form>
            </div>
          </div>
        </header>
        <nav className="hidden border-b border-slate-200 bg-white md:block">
          <div className="mx-auto flex max-w-6xl gap-1 px-4 py-2">
            {STORE_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100">{item.label}</Link>
            ))}
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 md:p-6 md:pb-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
          {STORE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex-1 py-3 text-center text-xs font-medium text-slate-600 hover:bg-slate-50">{item.label}</Link>
          ))}
        </nav>
      </div>
    )
  }

  // Staff / vendor / admin — full-height dark sidebar shell.
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="portal-dark fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#0A2540] md:flex">
        <div className="border-b border-white/10 px-4 py-4 text-white">
          <PortalLogoLink label={PORTAL_LABEL[portal]} />
        </div>
        <div className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-3">
          <PortalNavList groups={groups} theme="dark" />
        </div>
        <div className="border-t border-white/10 px-3 py-3">
          <Link href="/" className="mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-slate-300 transition hover:bg-white/5 hover:text-white">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.5 3H3v10h10V9.5M10 2.5h3.5V6M13 3L7.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            View store
          </Link>
          <div className="flex items-center justify-between gap-1 px-2 pt-1">
            <span className="min-w-0 flex-1 truncate text-xs text-slate-400" title={user.email}>{user.email}</span>
            <div className="flex shrink-0 items-center gap-0.5">
              <NotificationBell items={bellItems} unread={unread} placement="sidebar" />
              <form action={logout}>
                <button aria-label="Sign out" title="Sign out" className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2H3v12h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="portal-dark sticky top-0 z-20 flex h-12 items-center justify-between gap-2 border-b border-black/10 bg-[#0A2540] px-3 text-white md:hidden">
          <div className="flex items-center gap-2.5">
            <PortalMenu groups={groups} label={PORTAL_LABEL[portal]} />
            <PortalLogoLink label={PORTAL_LABEL[portal]} />
          </div>
          <NotificationBell items={bellItems} unread={unread} />
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
