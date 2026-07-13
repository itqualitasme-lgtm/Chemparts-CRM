'use client'

import { useState, useTransition } from 'react'
import DetailModal from '@/components/ui/DetailModal'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { confirmPurchaseOrder } from './actions'

export type VendorPORow = {
  id: string
  poNo: string
  status: string
  currency: string
  expectedDate: string | null
  notes: string | null
  createdAt: string
  items: { id: string; description: string; qty: number; unitCost: number }[]
}

const STATUS_BADGE: Record<string, string> = {
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

const PAGE_SIZE = 15

function money(n: number, ccy: string): string {
  return `${ccy} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
const poTotal = (r: VendorPORow) => r.items.reduce((n, it) => n + it.qty * it.unitCost, 0)

export default function VendorPOs({ rows }: { rows: VendorPORow[] }) {
  const [page, setPage] = useState(1)
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">PO</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Expected</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pageSlice(rows, page, PAGE_SIZE).map((r) => <Row key={r.id} r={r} />)}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
    </div>
  )
}

function Row({ r }: { r: VendorPORow }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function confirm() {
    setMsg(null)
    start(async () => {
      const res = await confirmPurchaseOrder(r.id)
      if (res.error) setMsg(res.error)
      else setOpen(false)
    })
  }

  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 align-middle">
        <td className="px-3 py-2 font-mono text-slate-900">{r.poNo}</td>
        <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
        <td className="px-3 py-2 font-medium text-slate-800">{money(poTotal(r), r.currency)}</td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{r.expectedDate ? fmtDate(r.expectedDate) : '—'}</td>
        <td className="px-3 py-2 text-right">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50" aria-haspopup="dialog">
            View
          </button>
        </td>
      </tr>
      <DetailModal
        open={open}
        onClose={() => setOpen(false)}
        header={
          <>
            <span className="font-mono text-sm font-semibold text-slate-900">{r.poNo}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span>
          </>
        }
        footer={
          r.status === 'SENT' ? (
            <>
              {msg ? <span className="mr-auto text-xs text-rose-600">{msg}</span> : null}
              <button type="button" disabled={pending} onClick={confirm} className="rounded-lg bg-[#0A2540] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#123a63] disabled:opacity-50">
                {pending ? 'Confirming…' : 'Confirm this PO'}
              </button>
            </>
          ) : undefined
        }
      >
        <div className="rounded-lg bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Line items</div>
          <ul className="divide-y divide-slate-100">
            {r.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 text-slate-800">{it.description}</span>
                <span className="shrink-0 font-mono text-slate-500">{it.qty} × {money(it.unitCost, r.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
            <span>Total</span><span>{money(poTotal(r), r.currency)}</span>
          </div>
        </div>
        {r.expectedDate ? <p className="text-sm text-slate-600"><span className="text-slate-400">Expected delivery:</span> {fmtDate(r.expectedDate)}</p> : null}
        {r.notes ? (
          <div className="rounded-lg bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notes from Chemparts</div>
            <p className="whitespace-pre-line px-3 py-2.5 text-sm text-slate-600">{r.notes}</p>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
