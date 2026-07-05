'use client'

import { useActionState, useState } from 'react'
import { updateQuotation, type QuotationState } from '../actions'

export type Line = { productId: string | null; productName: string; qty: number; unitPrice: number; discountPct: number; note: string }
type Header = {
  status: string
  currency: string
  vatPercent: number
  validUntil: string // yyyy-mm-dd
  notes: string
  terms: string
  deliveryTerms: string
  shipping: number
  otherCharges: number
  otherChargesLabel: string
  salesPersonId: string
}

const STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']
const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function QuotationEditor({
  quotationId,
  header,
  lines: initialLines,
  salesPeople = [],
}: {
  quotationId: string
  header: Header
  lines: Line[]
  salesPeople?: { id: string; name: string }[]
}) {
  const [state, formAction, pending] = useActionState<QuotationState, FormData>(
    updateQuotation.bind(null, quotationId),
    {},
  )
  const emptyLine = (): Line => ({ productId: null, productName: '', qty: 1, unitPrice: 0, discountPct: 0, note: '' })
  const [lines, setLines] = useState<Line[]>(initialLines.length ? initialLines : [emptyLine()])
  const [currency, setCurrency] = useState(header.currency)
  const [vat, setVat] = useState(header.vatPercent)
  const [shipping, setShipping] = useState(header.shipping)
  const [other, setOther] = useState(header.otherCharges)

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((ls) => [...ls, emptyLine()])
  const removeLine = (i: number) => setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, idx) => idx !== i)))

  const lineNet = (l: Line) => l.qty * l.unitPrice * (1 - (l.discountPct || 0) / 100)
  const subtotal = lines.reduce((s, l) => s + lineNet(l), 0)
  const vatAmt = (subtotal + shipping + other) * (vat / 100)
  const total = subtotal + shipping + other + vatAmt

  const itemsJson = JSON.stringify(
    lines
      .filter((l) => l.productName.trim())
      .map((l) => ({ productId: l.productId, productName: l.productName, qty: l.qty, unitPrice: l.unitPrice, discountPct: l.discountPct, note: l.note })),
  )

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="itemsJson" value={itemsJson} />

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Quotation saved.</p>}

      {/* Line items */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="w-16 px-3 py-2 font-medium">Qty</th>
              <th className="w-28 px-3 py-2 font-medium">Unit price</th>
              <th className="w-20 px-3 py-2 font-medium">Disc %</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Line total</th>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 align-top">
                <td className="px-3 py-2">
                  <input
                    value={l.productName}
                    onChange={(e) => setLine(i, { productName: e.target.value })}
                    placeholder="Item description"
                    className={inputCls}
                  />
                  <input
                    value={l.note}
                    onChange={(e) => setLine(i, { note: e.target.value })}
                    placeholder="Note (optional)"
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => setLine(i, { qty: Math.max(1, Math.floor(Number(e.target.value)) || 1) })}
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.unitPrice}
                    onChange={(e) => setLine(i, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={l.discountPct}
                    onChange={(e) => setLine(i, { discountPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-800">{money(lineNet(l), currency)}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => removeLine(i)} className="text-slate-400 hover:text-red-600" aria-label="Remove line">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 p-3">
          <button type="button" onClick={addLine} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            + Add line
          </button>
        </div>
      </section>

      {/* Totals + additional charges */}
      <section className="ml-auto max-w-sm space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{money(subtotal, currency)}</span></div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <input type="number" name="shipping" min={0} step="0.01" value={shipping} onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))} className="w-28 rounded border border-slate-300 px-2 py-1 text-right text-xs" />
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600">
          <input name="otherChargesLabel" defaultValue={header.otherChargesLabel} placeholder="Other charge (e.g. installation)" className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-xs" />
          <input type="number" name="otherCharges" min={0} step="0.01" value={other} onChange={(e) => setOther(Math.max(0, Number(e.target.value) || 0))} className="w-28 rounded border border-slate-300 px-2 py-1 text-right text-xs" />
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1">VAT
            <input type="number" name="vatPercent" min={0} step="0.5" value={vat} onChange={(e) => setVat(Math.max(0, Number(e.target.value) || 0))} className="w-16 rounded border border-slate-300 px-2 py-0.5 text-xs" />%
          </span>
          <span className="font-mono">{money(vatAmt, currency)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900"><span>Total</span><span className="font-mono">{money(total, currency)}</span></div>
      </section>

      {/* Header fields */}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
          <select name="status" defaultValue={header.status} className={inputCls}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Sales person</span>
          <select name="salesPersonId" defaultValue={header.salesPersonId} className={inputCls}>
            <option value="">Unassigned</option>
            {salesPeople.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Currency</span>
          <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
            {['AED', 'USD', 'QAR', 'EUR', 'SAR'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Valid until</span>
          <input type="date" name="validUntil" defaultValue={header.validUntil} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Delivery</span>
          <input name="deliveryTerms" defaultValue={header.deliveryTerms} placeholder="2–4 weeks from order confirmation" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Payment terms</span>
          <input name="terms" defaultValue={header.terms} placeholder="50% advance, balance before delivery · prices ex-works" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Notes (shown to customer)</span>
          <textarea name="notes" rows={3} defaultValue={header.notes} className={inputCls} />
        </label>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save quotation'}
      </button>
    </form>
  )
}
