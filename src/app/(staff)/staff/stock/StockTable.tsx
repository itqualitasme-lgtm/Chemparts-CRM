'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { setStockStatus } from './actions'

export type StockRow = {
  id: string
  name: string
  modelNo: string | null
  brand: string
  stockStatus: string
  stockTracked: boolean
}

const STATUSES = [
  { value: 'IN_STOCK', label: 'In stock', cls: 'bg-green-100 text-green-800', active: 'bg-green-600 text-white' },
  { value: 'ON_ORDER', label: 'On order', cls: 'bg-amber-100 text-amber-800', active: 'bg-amber-500 text-white' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock', cls: 'bg-rose-100 text-rose-700', active: 'bg-rose-600 text-white' },
] as const

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 20

export default function StockTable({ rows }: { rows: StockRow[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [q, status])

  const filtered = useMemo(() => {
    let r = rows
    if (status !== 'ALL') r = r.filter((x) => x.stockStatus === status)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((x) => [x.name, x.modelNo ?? '', x.brand].join(' ').toLowerCase().includes(s))
    return r
  }, [rows, q, status])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product, model, brand…"
          className={`${selectCls} min-w-0 flex-1`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by stock status">
          <option value="ALL">All stock</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Brand</th>
              <th className="px-3 py-2 font-medium">Set stock status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-3 py-10 text-center text-slate-500">No products match these filters.</td></tr>
            ) : (
              pageSlice(filtered, page, PAGE_SIZE).map((r) => <Row key={r.id} r={r} />)
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}

function Row({ r }: { r: StockRow }) {
  const [status, setStatusLocal] = useState(r.stockStatus)
  const [pending, start] = useTransition()

  function set(next: string) {
    if (next === status) return
    const prev = status
    setStatusLocal(next) // optimistic
    start(async () => {
      const res = await setStockStatus(r.id, next)
      if (res.error) setStatusLocal(prev) // roll back on failure
    })
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 align-middle">
      <td className="px-3 py-3">
        <div className="font-medium text-slate-800">{r.name}</div>
        {r.modelNo ? <div className="font-mono text-xs text-slate-500">{r.modelNo}</div> : null}
      </td>
      <td className="px-3 py-3 text-slate-600">{r.brand}</td>
      <td className="px-3 py-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200" role="group" aria-label="Stock status">
          {STATUSES.map((s) => {
            const on = status === s.value
            return (
              <button
                key={s.value}
                type="button"
                disabled={pending}
                onClick={() => set(s.value)}
                aria-pressed={on}
                className={`px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${on ? s.active : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </td>
    </tr>
  )
}
