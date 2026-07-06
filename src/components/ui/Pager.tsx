'use client'

// Shared client-side pager for the portal list tables. `total` is the filtered
// row count; `page`/`pageSize` drive the slice done by the caller.
export default function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const clamped = Math.min(Math.max(1, page), pageCount)
  const from = total === 0 ? 0 : (clamped - 1) * pageSize + 1
  const to = Math.min(clamped * pageSize, total)

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <span>{from}–{to} of {total}</span>
      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPage(clamped - 1)}
            disabled={clamped <= 1}
            className="rounded-lg border border-slate-300 px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-1">Page {clamped} / {pageCount}</span>
          <button
            type="button"
            onClick={() => onPage(clamped + 1)}
            disabled={clamped >= pageCount}
            className="rounded-lg border border-slate-300 px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

/** Slice helper the tables use with the pager. */
export function pageSlice<T>(rows: T[], page: number, pageSize: number): T[] {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const clamped = Math.min(Math.max(1, page), pageCount)
  return rows.slice((clamped - 1) * pageSize, clamped * pageSize)
}
