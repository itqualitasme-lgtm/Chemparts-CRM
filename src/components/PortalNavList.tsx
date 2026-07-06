'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavIcon from '@/components/ui/NavIcon'

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
    <nav className="flex flex-col">
      {groups.map((g, i) => (
        <div key={g.title ?? `g${i}`} className="mb-1.5">
          {g.title ? (
            <div className="px-2.5 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {g.title}
            </div>
          ) : null}
          {g.items.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-1.5 text-[13px] transition ${
                  active
                    ? 'border-[#0E7490] bg-slate-100 font-semibold text-[#0A2540]'
                    : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <NavIcon href={item.href} className={active ? 'text-[#0E7490]' : 'text-slate-400 group-hover:text-slate-500'} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
