'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { setStockStatus, setStockQty, bulkSetStockStatus } from './actions'

export type StockRow = {
  id: string
  name: string
  modelNo: string | null
  brand: string
  stockStatus: string
  stockTracked: boolean
  stockQty: number
  type: string
}

const TYPES = [
  { value: 'EQUIPMENT', label: 'Instruments' },
  { value: 'CONSUMABLE', label: 'Consumables' },
  { value: 'SPARE_PART', label: 'Spare parts' },
] as const

const STATUSES = [
  { value: 'IN_STOCK', label: 'In stock', cls: 'bg-green-100 text-green-800', active: 'bg-green-600 text-white' },
  { value: 'ON_ORDER', label: 'On order', cls: 'bg-amber-100 text-amber-800', active: 'bg-amber-500 text-white' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock', cls: 'bg-rose-100 text-rose-700', active: 'bg-rose-600 text-white' },
] as const
const STATUS_RANK: Record<string, number> = { IN_STOCK: 0, ON_ORDER: 1, OUT_OF_STOCK: 2 }

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 20

type SortKey = 'name' | 'brand' | 'qty' | 'status'

export default function StockTable({ rows }: { rows: StockRow[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPending, startBulk] = useTransition()
  useEffect(() => setPage(1), [q, status, type])

  const filtered = useMemo(() => {
    let r = rows
    if (status !== 'ALL') r = r.filter((x) => x.stockStatus === status)
    if (type !== 'ALL') r = r.filter((x) => x.type === type)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((x) => [x.name, x.modelNo ?? '', x.brand].join(' ').toLowerCase().includes(s))
    const dir = sortDir === 'asc' ? 1 : -1
    return [...r].sort((a, b) => {
      let c = 0
      if (sortKey === 'name') c = a.name.localeCompare(b.name)
      else if (sortKey === 'brand') c = a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
      else if (sortKey === 'qty') c = a.stockQty - b.stockQty
      else c = (STATUS_RANK[a.stockStatus] ?? 9) - (STATUS_RANK[b.stockStatus] ?? 9) || a.name.localeCompare(b.name)
      return c * dir
    })
  }, [rows, q, status, type, sortKey, sortDir])

  const pageRows = pageSlice(filtered, page, PAGE_SIZE)
  const pageIds = pageRows.map((r) => r.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }
  function toggleOne(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAllOnPage() {
    setSelected((s) => {
      const n = new Set(s)
      if (allOnPageSelected) pageIds.forEach((id) => n.delete(id))
      else pageIds.forEach((id) => n.add(id))
      return n
    })
  }
  function bulkSet(next: string) {
    const ids = [...selected]
    startBulk(async () => { await bulkSetStockStatus(ids, next); setSelected(new Set()) })
  }

  const Arrow = ({ k }: { k: SortKey }) => <span className="ml-1 text-slate-400">{sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
  const thBtn = 'flex items-center font-medium hover:text-slate-700'

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product, model, brand…" className={`${selectCls} min-w-0 flex-1`} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls} aria-label="Filter by category">
          <option value="ALL">All categories</option>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by stock status">
          <option value="ALL">All stock</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#0A2540]/20 bg-[#0A2540]/5 px-3 py-2 text-sm">
          <span className="font-medium text-slate-700">{selected.size} selected</span>
          <span className="text-slate-400">· set to</span>
          {STATUSES.map((s) => (
            <button key={s.value} type="button" disabled={bulkPending} onClick={() => bulkSet(s.value)} className={`rounded-md px-2.5 py-1 text-xs font-medium text-white transition disabled:opacity-50 ${s.active}`}>
              {s.label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-500 hover:underline">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="w-8 px-3 py-2"><input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} aria-label="Select all on page" /></th>
              <th className="px-3 py-2"><button type="button" className={thBtn} onClick={() => toggleSort('name')}>Product<Arrow k="name" /></button></th>
              <th className="px-3 py-2"><button type="button" className={thBtn} onClick={() => toggleSort('brand')}>Brand<Arrow k="brand" /></button></th>
              <th className="w-24 px-3 py-2"><button type="button" className={thBtn} onClick={() => toggleSort('qty')}>Qty<Arrow k="qty" /></button></th>
              <th className="px-3 py-2"><button type="button" className={thBtn} onClick={() => toggleSort('status')}>Stock status<Arrow k="status" /></button></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-500">No products match these filters.</td></tr>
            ) : (
              pageRows.map((r) => <Row key={r.id} r={r} selected={selected.has(r.id)} onToggle={() => toggleOne(r.id)} />)
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}

function Row({ r, selected, onToggle }: { r: StockRow; selected: boolean; onToggle: () => void }) {
  const [status, setStatusLocal] = useState(r.stockStatus)
  const [qty, setQtyLocal] = useState(String(r.stockQty))
  const [pending, start] = useTransition()

  function set(next: string) {
    if (next === status) return
    const prev = status
    setStatusLocal(next)
    start(async () => { const res = await setStockStatus(r.id, next); if (res.error) setStatusLocal(prev) })
  }
  function saveQty() {
    const n = Math.max(0, Math.floor(Number(qty) || 0))
    if (n === r.stockQty) return
    start(async () => { await setStockQty(r.id, n) })
  }

  return (
    <tr className={`border-b border-slate-100 last:border-0 align-middle ${selected ? 'bg-[#0A2540]/[0.03]' : ''}`}>
      <td className="px-3 py-3"><input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${r.name}`} /></td>
      <td className="px-3 py-3">
        <div className="font-medium text-slate-800">{r.name}</div>
        {r.modelNo ? <div className="font-mono text-xs text-slate-500">{r.modelNo}</div> : null}
      </td>
      <td className="px-3 py-3 text-slate-600">{r.brand}</td>
      <td className="px-3 py-3">
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQtyLocal(e.target.value)}
          onBlur={saveQty}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          disabled={pending}
          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm tabular-nums text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
          aria-label={`Quantity for ${r.name}`}
        />
      </td>
      <td className="px-3 py-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200" role="group" aria-label="Stock status">
          {STATUSES.map((s) => {
            const on = status === s.value
            return (
              <button key={s.value} type="button" disabled={pending} onClick={() => set(s.value)} aria-pressed={on}
                className={`px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${on ? s.active : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {s.label}
              </button>
            )
          })}
        </div>
      </td>
    </tr>
  )
}
