'use client'

import { useEffect, useState } from 'react'
import PortalNavList, { type NavGroup } from '@/components/PortalNavList'

// Mobile-only hamburger + slide-in drawer. On desktop the same nav is shown as
// a persistent sidebar (see PortalShell), so the hamburger is hidden at md+.
export default function PortalMenu({ groups, label }: { groups: NavGroup[]; label: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 text-white transition hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop + slide-in drawer (always mounted so it can animate). */}
      <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={`${label} menu`}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <PortalNavList groups={groups} onNavigate={() => setOpen(false)} />
          </div>
        </aside>
      </div>
    </div>
  )
}
