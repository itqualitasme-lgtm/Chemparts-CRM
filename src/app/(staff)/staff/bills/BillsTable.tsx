'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { setBillStatus } from './actions'

export type BillRow = {
  id: string
  billNo: string
  amount: number
  currency: string
  status: string
  note: string | null
  dueDate: string | null
  createdAt: string
  vendor: string
  poNo: string | null
  fileUrl: string | null
}

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-rose-100 text-rose-700',
}

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 20

function money(n: number, ccy: string): string {
  return `${ccy} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BillsTable({ rows }: { rows: BillRow[] }) {
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [status])

  const filtered = useMemo(() => (status === 'ALL' ? rows : rows.filter((r) => r.status === status)), [rows, status])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Invoice</th>
              <th className="px-3 py-2 font-medium">Vendor</th>
              <th className="px-3 py-2 font-medium">PO</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Due</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">No bills match these filters.</td></tr>
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

function Row({ r }: { r: BillRow }) {
  const [status, setStatusLocal] = useState(r.status)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function move(to: string) {
    const prev = status
    setStatusLocal(to)
    setMsg(null)
    start(async () => {
      const res = await setBillStatus(r.id, to)
      if (res.error) { setStatusLocal(prev); setMsg(res.error) }
    })
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 align-middle">
      <td className="px-3 py-3">
        <div className="font-mono text-slate-800">{r.billNo}</div>
        {r.note ? <div className="text-xs text-slate-500">{r.note}</div> : null}
        {r.fileUrl ? <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0E7490] hover:underline">View invoice ↗</a> : <span className="text-xs text-slate-300">no file</span>}
      </td>
      <td className="px-3 py-3 text-slate-700">{r.vendor}</td>
      <td className="px-3 py-3 font-mono text-xs text-slate-500">{r.poNo ?? ''}</td>
      <td className="px-3 py-3 font-medium text-slate-800">{money(r.amount, r.currency)}</td>
      <td className="px-3 py-3">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-600'}`}>{status}</span>
        {msg ? <div className="mt-1 text-xs text-rose-600">{msg}</div> : null}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{r.dueDate ? fmtDate(r.dueDate) : ''}</td>
      <td className="px-3 py-3 text-right">
        <div className="flex flex-wrap justify-end gap-1.5">
          {status === 'SUBMITTED' && (
            <>
              <button type="button" disabled={pending} onClick={() => move('APPROVED')} className="rounded-lg bg-[#0A2540] px-2.5 py-1 text-xs font-medium text-white transition hover:bg-[#123a63] disabled:opacity-50">Approve</button>
              <button type="button" disabled={pending} onClick={() => move('REJECTED')} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">Reject</button>
            </>
          )}
          {status === 'APPROVED' && (
            <button type="button" disabled={pending} onClick={() => move('PAID')} className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50">Mark paid</button>
          )}
          {(status === 'PAID' || status === 'REJECTED') && <span className="text-xs text-slate-300"></span>}
        </div>
      </td>
    </tr>
  )
}
