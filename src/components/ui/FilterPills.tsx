'use client'

export type PillOption = { value: string; label: string; count: number }

/**
 * Status filter as pill tabs with counts (Base44-style), replacing a plain
 * <select>. The active pill is solid navy; the rest are soft grey.
 */
export default function FilterPills({
  options,
  value,
  onChange,
  ariaLabel = 'Filter',
}: {
  options: PillOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active ? 'bg-[#0A2540] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {o.label}
            <span className={`ml-1.5 tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>{o.count}</span>
          </button>
        )
      })}
    </div>
  )
}
