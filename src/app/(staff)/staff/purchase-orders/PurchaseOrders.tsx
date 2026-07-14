'use client'

import { useActionState, useMemo, useState, useTransition } from 'react'
import DetailModal from '@/components/ui/DetailModal'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { createPurchaseOrder, setPOStatus, type POState } from './actions'

export type PORow = {
  id: string
  poNo: string
  status: string
  currency: string
  vendor: string
  expectedDate: string | null
  notes: string | null
  createdAt: string
  items: { id: string; description: string; qty: number; unitCost: number }[]
  bills: { id: string; billNo: string; amount: number; status: string }[]
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

// The next workflow step(s) staff can take from a given status.
const NEXT: Record<string, { to: string; label: string; primary?: boolean }[]> = {
  DRAFT: [{ to: 'SENT', label: 'Send to vendor', primary: true }, { to: 'CANCELLED', label: 'Cancel' }],
  SENT: [{ to: 'CONFIRMED', label: 'Mark confirmed', primary: true }, { to: 'CANCELLED', label: 'Cancel' }],
  CONFIRMED: [{ to: 'RECEIVED', label: 'Mark received', primary: true }, { to: 'CANCELLED', label: 'Cancel' }],
  RECEIVED: [],
  CANCELLED: [{ to: 'DRAFT', label: 'Reopen as draft' }],
}

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 15

function money(n: number, ccy: string): string {
  return `${ccy} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
const poTotal = (r: PORow) => r.items.reduce((n, it) => n + it.qty * it.unitCost, 0)

type Vendor = { id: string; companyName: string; currency: string }
type Draft = { description: string; qty: string; unitCost: string }

export default function PurchaseOrders({ rows, vendors }: { rows: PORow[]; vendors: Vendor[] }) {
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md bg-[#0A2540] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#123a63]"
        >
          {creating ? 'Close' : '+ New purchase order'}
        </button>
      </div>

      {creating && <CreateForm vendors={vendors} onDone={() => setCreating(false)} />}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No purchase orders yet. Raise one to a vendor with “New purchase order”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">PO</th>
                <th className="px-3 py-2 font-medium">Vendor</th>
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
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
    </div>
  )
}

function Row({ r }: { r: PORow }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function move(to: string) {
    setMsg(null)
    start(async () => {
      const res = await setPOStatus(r.id, to)
      if (res.error) setMsg(res.error)
      else setOpen(false)
    })
  }

  const total = poTotal(r)

  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 align-middle">
        <td className="px-3 py-2 font-mono text-slate-900">{r.poNo}</td>
        <td className="px-3 py-2 text-slate-700">{r.vendor}</td>
        <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
        <td className="px-3 py-2 font-medium text-slate-800">{money(total, r.currency)}</td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{r.expectedDate ? fmtDate(r.expectedDate) : ''}</td>
        <td className="px-3 py-2 text-right">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50" aria-haspopup="dialog">
            Manage
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
            <span className="text-xs text-slate-400">{r.vendor}</span>
          </>
        }
        footer={
          <>
            {msg ? <span className="mr-auto text-xs text-rose-600">{msg}</span> : null}
            {NEXT[r.status]?.map((n) => (
              <button
                key={n.to}
                type="button"
                disabled={pending}
                onClick={() => move(n.to)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                  n.primary ? 'bg-[#0A2540] text-white hover:bg-[#123a63]' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n.label}
              </button>
            ))}
          </>
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

        {r.expectedDate ? <p className="text-sm text-slate-600"><span className="text-slate-400">Expected:</span> {fmtDate(r.expectedDate)}</p> : null}
        {r.notes ? (
          <div className="rounded-lg bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notes</div>
            <p className="whitespace-pre-line px-3 py-2.5 text-sm text-slate-600">{r.notes}</p>
          </div>
        ) : null}

        <div className="rounded-lg bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bills</div>
          {r.bills.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-slate-400">No bills submitted against this PO yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {r.bills.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="font-mono text-slate-700">{b.billNo}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-600">{money(b.amount, r.currency)}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{b.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DetailModal>
    </>
  )
}

function CreateForm({ vendors, onDone }: { vendors: Vendor[]; onDone: () => void }) {
  const [items, setItems] = useState<Draft[]>([{ description: '', qty: '1', unitCost: '0' }])
  const [state, formAction, pending] = useActionState<POState, FormData>(async (prev, fd) => {
    fd.set('itemsJson', JSON.stringify(items.map((it) => ({ description: it.description, qty: Number(it.qty), unitCost: Number(it.unitCost) }))))
    const res = await createPurchaseOrder(prev, fd)
    if (res.ok) onDone()
    return res
  }, {})

  const total = useMemo(() => items.reduce((n, it) => n + (Number(it.qty) || 0) * (Number(it.unitCost) || 0), 0), [items])

  function patch(i: number, k: keyof Draft, v: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))
  }

  return (
    <form action={formAction} className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Vendor</span>
          <select name="vendorId" required className={`${selectCls} w-full`}>
            <option value="">Choose a vendor…</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.companyName} ({v.currency})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Expected delivery (optional)</span>
          <input type="date" name="expectedDate" className={`${selectCls} w-full`} />
        </label>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-slate-500">Line items</div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input value={it.description} onChange={(e) => patch(i, 'description', e.target.value)} placeholder="Description" className={`${selectCls} min-w-[12rem] flex-1`} />
              <input value={it.qty} onChange={(e) => patch(i, 'qty', e.target.value)} type="number" min="1" className={`${selectCls} w-20`} aria-label="Quantity" />
              <input value={it.unitCost} onChange={(e) => patch(i, 'unitCost', e.target.value)} type="number" min="0" step="0.01" className={`${selectCls} w-28`} aria-label="Unit cost" />
              {items.length > 1 && (
                <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-rose-600 hover:underline">Remove</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setItems((prev) => [...prev, { description: '', qty: '1', unitCost: '0' }])} className="mt-2 text-xs font-medium text-[#0E7490] hover:underline">
          + Add line
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</span>
        <textarea name="notes" rows={2} className={`${selectCls} w-full`} placeholder="Delivery terms, references…" />
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-3">
        <span className="mr-auto text-sm text-slate-500">Subtotal: <span className="font-semibold text-slate-800">{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
        {state.error ? <span className="text-xs text-rose-600">{state.error}</span> : null}
        <button type="submit" disabled={pending} className="rounded-lg bg-[#0A2540] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-50">
          {pending ? 'Creating…' : 'Create draft PO'}
        </button>
      </div>
    </form>
  )
}
