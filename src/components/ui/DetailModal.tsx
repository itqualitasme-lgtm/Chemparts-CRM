'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * A centered modal "window" for list-view row details — replaces inline row
 * expansion across the portal. Portal-rendered over the page with a dimmed
 * backdrop; closes on the ✕, Escape, or a backdrop click, and locks body
 * scroll while open. Pass row-summary content as `header` and action buttons
 * as `footer`; the body is `children`.
 */
export default function DetailModal({
  open,
  onClose,
  header,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  header: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-2 w-full max-w-2xl rounded-xl bg-white shadow-2xl sm:my-6"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-xl border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">{header}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="space-y-3 p-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-slate-200 bg-slate-50 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
