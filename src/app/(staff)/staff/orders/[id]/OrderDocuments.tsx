'use client'

import { useActionState, useState, useTransition } from 'react'
import { uploadOrderDocument, removeOrderDocument, type OrderDocState } from '../actions'

type Doc = { id: string; kind: string; label: string; url: string }

const KINDS = [
  ['INVOICE', 'Invoice'],
  ['WARRANTY', 'Warranty'],
  ['PURCHASE_ORDER', 'Purchase order'],
  ['DELIVERY_NOTE', 'Delivery note'],
  ['OTHER', 'Other'],
] as const

const KIND_BADGE: Record<string, string> = {
  INVOICE: 'bg-green-100 text-green-800',
  WARRANTY: 'bg-blue-100 text-blue-800',
  PURCHASE_ORDER: 'bg-amber-100 text-amber-800',
  DELIVERY_NOTE: 'bg-slate-100 text-slate-600',
  OTHER: 'bg-slate-100 text-slate-600',
}

export default function OrderDocuments({ orderId, documents }: { orderId: string; documents: Doc[] }) {
  const [state, formAction, pending] = useActionState<OrderDocState, FormData>(uploadOrderDocument.bind(null, orderId), {})
  const [removing, startRemove] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-1 font-medium text-slate-800">Documents</h2>
      <p className="mb-4 text-sm text-slate-500">Attach the Zoho invoice, warranty paper, the customer’s purchase order and delivery notes. The customer sees invoice + warranty in their account.</p>

      {documents.length > 0 && (
        <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${KIND_BADGE[d.kind] ?? KIND_BADGE.OTHER}`}>
                  {d.kind.replace('_', ' ')}
                </span>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[#0A2540] underline">{d.label}</a>
              </span>
              <button
                type="button"
                disabled={removing}
                onClick={() => startRemove(() => removeOrderDocument(d.id))}
                className="text-slate-500 underline hover:text-red-600 disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Type</span>
          <select name="kind" defaultValue="INVOICE" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900">
            {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Label (optional)</span>
          <input name="label" placeholder="e.g. Invoice INV-2026-014" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
        </label>
        <input
          type="file"
          name="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
        />
        <button
          type="submit"
          disabled={pending || !fileName}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60 sm:col-span-3 sm:w-auto"
        >
          {pending ? 'Uploading…' : 'Upload document'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="mt-2 text-sm text-green-700">Document uploaded.</p>}
    </section>
  )
}
