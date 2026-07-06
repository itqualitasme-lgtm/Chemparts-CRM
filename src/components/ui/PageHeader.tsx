import type { ReactNode } from 'react'

// Compact, consistent page header for the portal. Small title + muted subtitle,
// optional right-aligned action (e.g. a "+ New" button).
export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
