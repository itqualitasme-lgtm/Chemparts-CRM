'use client'

import { useState, useTransition } from 'react'
import { sendPriceUpdate, type PriceUpdateItem, type RespondPriceState } from './actions'
import type { RespondItem } from './PriceRequestsTable'

type LineState = {
  mode: 'quote' | 'ask'
  price: string
  currency: string
  validUntil: string
  note: string
}

const inputCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

/**
 * One response covering all of a client's open price requests. Each line is
 * either priced (Confirm) or flagged for more detail (Ask). Sends a single email.
 */
export default function RespondForm({ items, clientEmail }: { items: RespondItem[]; clientEmail: string | null }) {
  const [lines, setLines] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      items.map((it) => [
        it.id,
        { mode: 'quote', price: it.defaultPrice != null ? String(it.defaultPrice) : '', currency: it.defaultCurrency || 'AED', validUntil: '', note: '' },
      ]),
    ),
  )
  const [message, setMessage] = useState('')
  const [state, setState] = useState<RespondPriceState>({})
  const [pending, start] = useTransition()

  const set = (id: string, patch: Partial<LineState>) => setLines((s) => ({ ...s, [id]: { ...s[id], ...patch } }))

  function submit() {
    const payload: PriceUpdateItem[] = items.map((it) => {
      const l = lines[it.id]
      return l.mode === 'quote'
        ? { requestId: it.id, mode: 'quote' as const, price: Number(l.price), currency: l.currency, validUntil: l.validUntil }
        : { requestId: it.id, mode: 'ask' as const, note: l.note }
    })
    start(async () => setState(await sendPriceUpdate({ message, items: payload })))
  }

  if (state.ok) {
    return (
      <div className={`rounded-lg px-3 py-2 text-sm ${state.warning ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'bg-green-50 text-green-700 ring-1 ring-green-200'}`}>
        {state.warning ?? (state.emailed ? `Sent to ${clientEmail}. Price request closed.` : 'Saved.')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.length > 1 ? (
        <p className="text-xs text-slate-500">This client has {items.length} open items — they’ll all go in one email.</p>
      ) : null}

      {items.map((it) => {
        const l = lines[it.id]
        return (
          <div key={it.id} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">{it.productName}{it.qty > 1 ? <span className="text-slate-400"> × {it.qty}</span> : null}</div>
                {it.modelNo ? <div className="font-mono text-xs text-slate-500">{it.modelNo}</div> : null}
                <div className="mt-0.5 text-xs text-slate-400">Current: {it.currentPrice || '—'} · {it.currentMode.replace('_', ' ')}{it.status === 'AWAITING_INFO' ? ' · awaiting info' : ''}</div>
              </div>
              <div className="flex shrink-0 overflow-hidden rounded-lg border border-slate-200 text-xs">
                <button type="button" onClick={() => set(it.id, { mode: 'quote' })} className={`px-2.5 py-1 font-medium ${l.mode === 'quote' ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-500'}`}>Confirm price</button>
                <button type="button" onClick={() => set(it.id, { mode: 'ask' })} className={`px-2.5 py-1 font-medium ${l.mode === 'ask' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500'}`}>Ask for details</button>
              </div>
            </div>

            {l.mode === 'quote' ? (
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">Price</span>
                  <input type="number" step="0.01" min="0" value={l.price} onChange={(e) => set(it.id, { price: e.target.value })} className={`${inputCls} w-28`} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">Currency</span>
                  <input type="text" maxLength={3} value={l.currency} onChange={(e) => set(it.id, { currency: e.target.value.toUpperCase() })} className={`${inputCls} w-20 uppercase`} /></label>
                <label className="flex flex-col gap-1"><span className="text-xs text-slate-500">Valid until</span>
                  <input type="date" value={l.validUntil} onChange={(e) => set(it.id, { validUntil: e.target.value })} className={inputCls} /></label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-amber-700">What details do you need to quote this? (the client sees this)</span>
                <textarea
                  value={l.note}
                  onChange={(e) => set(it.id, { note: e.target.value })}
                  rows={2}
                  placeholder="e.g. sample type, required standard (ASTM/ISO), and quantity"
                  className={`${inputCls} w-full`}
                />
                <span className="mt-1 block text-[11px] text-amber-600">Kept open as “awaiting info” until the client replies.</span>
              </label>
            )}
          </div>
        )
      })}

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">Covering note (optional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Optional greeting/note shown above the items in the email."
          className={`${inputCls} w-full`}
        />
      </label>

      {!clientEmail ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          No email on file for this client — changes will save, but nothing can be sent. Reach them another way.
        </p>
      ) : (
        <p className="text-xs text-slate-400">One email to <span className="font-medium text-slate-600">{clientEmail}</span>, CC info@chemparts-me.com. Their reply goes to the info inbox.</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Sending…' : clientEmail ? 'Send update' : 'Save (no email)'}
      </button>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </div>
  )
}
