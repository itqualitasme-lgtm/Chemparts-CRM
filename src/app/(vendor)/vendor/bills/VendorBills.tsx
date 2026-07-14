'use client'

import { useActionState, useState } from 'react'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { submitBill, type SubmitBillState } from './actions'

export type VendorBillRow = {
  id: string
  billNo: string
  amount: number
  currency: string
  status: string
  note: string | null
  dueDate: string | null
  createdAt: string
  poNo: string | null
  fileUrl: string | null
}

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-rose-100 text-rose-700',
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 15

function money(n: number, ccy: string): string {
  return `${ccy} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function VendorBills({
  rows,
  pos,
  linked,
}: {
  rows: VendorBillRow[]
  pos: { id: string; poNo: string }[]
  linked: boolean
}) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)

  if (!linked) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-800">
        Your account isn&rsquo;t linked to a vendor yet. Contact Chemparts to finish setup.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-md bg-[#0A2540] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#123a63]">
          {open ? 'Close' : '+ Submit a bill'}
        </button>
      </div>

      {open && <SubmitForm pos={pos} onDone={() => setOpen(false)} />}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No bills submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">PO</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice(rows, page, PAGE_SIZE).map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0 align-middle">
                  <td className="px-3 py-3">
                    <div className="font-mono text-slate-800">{b.billNo}</div>
                    {b.note ? <div className="text-xs text-slate-500">{b.note}</div> : null}
                    {b.fileUrl ? <a href={b.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0E7490] hover:underline">View invoice ↗</a> : null}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">{b.poNo ?? ''}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{money(b.amount, b.currency)}</td>
                  <td className="px-3 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>{b.status}</span></td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{fmtDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
    </div>
  )
}

function SubmitForm({ pos, onDone }: { pos: { id: string; poNo: string }[]; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<SubmitBillState, FormData>(async (prev, fd) => {
    const res = await submitBill(prev, fd)
    if (res.ok) onDone()
    return res
  }, {})

  return (
    <form action={formAction} className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Your invoice number</span>
          <input name="billNo" required className={inputCls} placeholder="INV-2026-0001" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Against purchase order</span>
          <select name="poId" className={inputCls}>
            <option value="">— None —</option>
            {pos.map((p) => <option key={p.id} value={p.id}>{p.poNo}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Amount</span>
          <input name="amount" type="number" min="0.01" step="0.01" required className={inputCls} placeholder="0.00" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Due date (optional)</span>
          <input name="dueDate" type="date" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-500">Invoice file (optional — PDF, PNG, JPEG, WEBP · max 15MB)</span>
          <input name="file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className={`${inputCls} file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:text-slate-700`} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Note (optional)</span>
        <textarea name="note" rows={2} className={inputCls} placeholder="Anything Chemparts should know about this invoice" />
      </label>
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
        {state.error ? <span className="text-xs text-rose-600">{state.error}</span> : null}
        <button type="submit" disabled={pending} className="rounded-lg bg-[#0A2540] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-50">
          {pending ? 'Submitting…' : 'Submit bill'}
        </button>
      </div>
    </form>
  )
}
