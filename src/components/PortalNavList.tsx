'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavIcon from '@/components/ui/NavIcon'

type NavItem = { href: string; label: string; badge?: number }
export type NavGroup = { title?: string; items: NavItem[] }

// Dashboard/overview roots match only exactly (so /admin doesn't stay active on
// /admin/users). Everything else matches on prefix.
const ROOTS = new Set(['/admin', '/staff', '/vendor', '/account'])

export default function PortalNavList({
  groups,
  onNavigate,
  theme = 'light',
}: {
  groups: NavGroup[]
  onNavigate?: () => void
  theme?: 'light' | 'dark'
}) {
  const pathname = usePathname() || ''
  const isActive = (href: string) =>
    ROOTS.has(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  const dark = theme === 'dark'

  return (
    <nav className="flex flex-col">
      {groups.map((g, i) => (
        <div key={g.title ?? `g${i}`} className="mb-1.5">
          {g.title ? (
            <div className={`px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
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
                className={`group mb-0.5 flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-[13px] transition ${
                  active
                    ? dark
                      ? 'border-[#22D3EE] bg-white/10 font-semibold text-white'
                      : 'border-[#0E7490] bg-slate-100 font-semibold text-[#0A2540]'
                    : dark
                      ? 'border-transparent text-slate-200 hover:bg-white/5 hover:text-white'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <NavIcon
                  href={item.href}
                  className={
                    active
                      ? dark ? 'text-[#22D3EE]' : 'text-[#0E7490]'
                      : dark ? 'text-slate-300 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-500'
                  }
                />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
