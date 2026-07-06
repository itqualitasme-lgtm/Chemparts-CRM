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
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${DOT[tone]}`} />
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-slate-400">{hint}</div> : null}
    </Link>
  )
}
