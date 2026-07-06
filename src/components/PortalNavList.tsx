'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { href: string; label: string }
export type NavGroup = { title?: string; items: NavItem[] }

// Dashboard/overview roots match only exactly (so /admin doesn't stay active on
// /admin/users). Everything else matches on prefix.
const ROOTS = new Set(['/admin', '/staff', '/vendor', '/account'])

export default function PortalNavList({
  groups,
  onNavigate,
}: {
  groups: NavGroup[]
  onNavigate?: () => void
}) {
  const pathname = usePathname() || ''
  const isActive = (href: string) =>
    ROOTS.has(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav className="flex flex-col gap-0.5">
      {groups.map((g, i) => (
        <div key={g.title ?? `g${i}`} className="mb-1">
          {g.title ? (
            <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {g.title}
            </div>
          ) : null}
          {g.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`block rounded-lg border-l-2 px-3 py-2 text-sm transition ${
                isActive(item.href)
                  ? 'border-[#0A2540] bg-slate-100 font-semibold text-[#0A2540]'
                  : 'border-transparent text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
