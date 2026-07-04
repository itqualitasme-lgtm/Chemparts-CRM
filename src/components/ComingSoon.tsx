export default function ComingSoon({
  title,
  phase,
  children,
}: {
  title: string
  phase?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {phase && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            {phase}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-600">This module is in development.</p>
        {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
      </div>
    </div>
  )
}
