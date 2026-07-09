import Link from 'next/link'

type Tone = 'default' | 'amber' | 'blue' | 'green' | 'indigo'

const DOT: Record<Tone, string> = {
  default: 'bg-slate-300',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-500',
}

/** Compact clickable metric card for the portal dashboard. */
export default function StatCard({
  label,
  value,
  href,
  hint,
  tone = 'default',
}: {
  label: string
  value: number | string
  href: string
  hint?: string
  tone?: Tone
}) {
  // Amber tone = "needs attention": tint the surface so it stands out in the grid
  // (fulfils the dashboard's "what needs attention today" promise).
  const attention = tone === 'amber'
  return (
    <Link
      href={href}
      className={`group rounded-lg border px-3 py-2.5 transition hover:shadow-sm ${
        attention
          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</div>
      {hint ? <div className={`text-[11px] ${attention ? 'text-amber-700' : 'text-slate-500'}`}>{hint}</div> : null}
    </Link>
  )
}
