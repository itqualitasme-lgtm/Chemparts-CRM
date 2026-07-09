'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/notification-actions'

export type BellItem = {
  id: string
  kind: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  readByName: string | null
  createdAt: string
}

const DOT: Record<string, string> = {
  ENQUIRY: 'bg-amber-500',
  SERVICE: 'bg-blue-500',
  PRICE: 'bg-indigo-500',
  INFO: 'bg-slate-400',
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function NotificationBell({ items, unread, placement = 'topbar' }: { items: BellItem[]; unread: number; placement?: 'topbar' | 'sidebar' }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function openItem(it: BellItem) {
    if (!it.readAt) start(async () => { await markNotificationRead(it.id); router.refresh() })
    if (it.link) {
      setOpen(false)
      router.push(it.link)
    }
  }

  function markAll() {
    start(async () => { await markAllNotificationsRead(); router.refresh() })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-100 transition hover:bg-white/10"
      >
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2a4.5 4.5 0 00-4.5 4.5c0 3.5-1.2 4.7-1.2 4.7h11.4s-1.2-1.2-1.2-4.7A4.5 4.5 0 009 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.4 14a1.7 1.7 0 003.2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={`absolute z-50 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xl ${placement === 'sidebar' ? 'bottom-10 left-0' : 'right-0 top-10'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 ? (
              <button type="button" onClick={markAll} disabled={pending} className="text-xs font-medium text-[#0E7490] hover:underline disabled:opacity-50">
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-400">No notifications.</p>
            ) : (
              items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => openItem(it)}
                  className={`flex w-full items-start gap-2.5 border-b border-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-50 ${it.readAt ? '' : 'bg-[#0E7490]/[0.04]'}`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${it.readAt ? 'bg-slate-200' : DOT[it.kind] ?? DOT.INFO}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13px] ${it.readAt ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{it.title}</span>
                    {it.body ? <span className="block truncate text-xs text-slate-500">{it.body}</span> : null}
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      {timeAgo(it.createdAt)}
                      {it.readAt && it.readByName ? ` · read by ${it.readByName}` : ''}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
