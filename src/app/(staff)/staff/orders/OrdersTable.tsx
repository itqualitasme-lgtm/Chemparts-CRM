'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import Pager, { pageSlice } from '@/components/ui/Pager'

export type OrderRow = {
  id: string
  orderNo: string
  customer: string
  fromQuote: string
  total: string
  docs: number
  status: string
  date: string
  createdAt: string
}

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'CLOSED', 'CANCELLED']
const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 15

export default function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let r = rows
    if (status !== 'ALL') r = r.filter((x) => x.status === status)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((x) => [x.orderNo, x.customer, x.fromQuote].join(' ').toLowerCase().includes(s))
    return [...r].sort((a, b) => (sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)))
  }, [rows, q, status, sort])

  const pageRows = pageSlice(filtered, page, PAGE_SIZE)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search no., customer, quotation…" className={`${selectCls} min-w-0 flex-1`} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className={selectCls} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5 font-medium">Order</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">From</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 text-center font-medium">Docs</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No orders match these filters.</td></tr>
            ) : (
              pageRows.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{o.orderNo}</td>
                  <td className="px-4 py-2.5 text-slate-600">{o.customer}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{o.fromQuote}</td>
                  <td className="px-4 py-2.5 text-slate-800">{o.total}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{o.docs}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-2.5 text-slate-600">{o.date}</td>
                  <td className="px-4 py-2.5 text-right"><Link href={`/staff/orders/${o.id}`} className="text-[#0A2540] underline">Open</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}
