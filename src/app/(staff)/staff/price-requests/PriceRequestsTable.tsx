'use client'

import { useEffect, useMemo, useState } from 'react'
import RespondForm from './RespondForm'
import Pager, { pageSlice } from '@/components/ui/Pager'
import DetailModal from '@/components/ui/DetailModal'

const PAGE_SIZE = 15

export type PriceRow = {
  id: string
  status: string
  createdAt: string // ISO
  productName: string
  modelNo: string | null
  brand: string
  requester: string
  contact: string | null
  qty: number
  message: string | null
  currentPrice: string
  currentMode: string
  defaultCurrency: string
  defaultPrice: number | null
  quotedText: string | null
}

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  QUOTED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-100 text-slate-600',
}
const MODE_BADGE: Record<string, string> = {
  listed: 'bg-green-100 text-green-800',
  indicative: 'bg-amber-100 text-amber-800',
  on_request: 'bg-slate-100 text-slate-600',
}

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PriceRequestsTable({ requests }: { requests: PriceRow[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [q, status, sort])

  const filtered = useMemo(() => {
    let rows = requests
    if (status !== 'ALL') rows = rows.filter((r) => r.status === status)
    const s = q.trim().toLowerCase()
    if (s) {
      rows = rows.filter((r) =>
        [r.productName, r.modelNo ?? '', r.brand, r.requester, r.contact ?? ''].join(' ').toLowerCase().includes(s),
      )
    }
    return [...rows].sort((a, b) => (sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)))
  }, [requests, q, status, sort])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product, model, requester…"
          className={`${selectCls} min-w-0 flex-1`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="QUOTED">Quoted</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className={selectCls} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Received</th>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Brand</th>
              <th className="px-3 py-2 font-medium">Requester</th>
              <th className="px-3 py-2 text-center font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Current price</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">No price requests match these filters.</td>
              </tr>
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

function Row({ r }: { r: PriceRow }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 align-middle">
        <td className="px-3 py-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{fmtDate(r.createdAt)}</td>
        <td className="px-3 py-2">
          <div className="font-medium text-slate-800">{r.productName}</div>
          {r.modelNo ? <div className="font-mono text-xs text-slate-500">{r.modelNo}</div> : null}
        </td>
        <td className="px-3 py-2 text-slate-600">{r.brand}</td>
        <td className="px-3 py-2">
          <div className="text-slate-700">{r.requester}</div>
          {r.contact ? <div className="text-xs text-slate-500">{r.contact}</div> : null}
        </td>
        <td className="px-3 py-2 text-center text-slate-600">{r.qty}</td>
        <td className="px-3 py-2">
          <span className="font-medium text-slate-800">{r.currentPrice}</span>{' '}
          <span className={`rounded px-2 py-0.5 text-xs ${MODE_BADGE[r.currentMode]}`}>{r.currentMode.replace('_', ' ')}</span>
        </td>
        <td className="px-3 py-2 text-right">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-haspopup="dialog"
          >
            {r.status === 'OPEN' ? 'Respond' : 'View'}
          </button>
        </td>
      </tr>
      <DetailModal
        open={open}
        onClose={() => setOpen(false)}
        header={
          <>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span>
            <span className="text-sm font-semibold text-slate-900">{r.productName}</span>
            {r.modelNo ? <span className="font-mono text-xs text-slate-400">{r.modelNo}</span> : null}
            <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
          </>
        }
      >
        {/* Requester + current price */}
        <div className="rounded-lg bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Request</div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 px-3 py-2.5 text-sm sm:grid-cols-2">
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Requester</dt><dd className="min-w-0 font-medium text-slate-800">{r.requester}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Contact</dt><dd className="min-w-0 truncate text-slate-700">{r.contact || <span className="text-slate-300"></span>}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Brand</dt><dd className="min-w-0 text-slate-700">{r.brand}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Quantity</dt><dd className="min-w-0 text-slate-700">{r.qty}</dd></div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-400">Current price</dt>
              <dd className="min-w-0 text-slate-700">
                <span className="font-medium text-slate-800">{r.currentPrice}</span>{' '}
                <span className={`rounded px-2 py-0.5 text-xs ${MODE_BADGE[r.currentMode]}`}>{r.currentMode.replace('_', ' ')}</span>
              </dd>
            </div>
          </dl>
        </div>

        {r.message ? (
          <div className="rounded-lg bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Message</div>
            <p className="whitespace-pre-line px-3 py-2.5 text-sm leading-relaxed text-slate-600">{r.message}</p>
          </div>
        ) : null}

        {r.status === 'OPEN' ? (
          <RespondForm requestId={r.id} defaultCurrency={r.defaultCurrency} defaultPrice={r.defaultPrice} />
        ) : (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">{r.quotedText}</p>
        )}
      </DetailModal>
    </>
  )
}
