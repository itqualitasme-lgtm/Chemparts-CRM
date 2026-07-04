'use client'

import { useActionState, useState, useTransition } from 'react'
import { uploadCustomerDocument, removeCustomerDocument, type DocState } from '../actions'

type Doc = { id: string; label: string; url: string }

export default function DocumentsPanel({ customerId, documents }: { customerId: string; documents: Doc[] }) {
  const [state, formAction, pending] = useActionState<DocState, FormData>(
    uploadCustomerDocument.bind(null, customerId),
    {},
  )
  const [removing, startRemove] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-1 font-medium text-slate-800">Documents</h2>
      <p className="mb-4 text-sm text-slate-500">Trade licence, VAT certificate, agreements. PDF or image, up to 10MB.</p>

      {documents.length > 0 && (
        <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[#0A2540] underline">
                {d.label}
              </a>
              <button
                type="button"
                disabled={removing}
                onClick={() => startRemove(() => removeCustomerDocument(d.id))}
                className="text-slate-500 underline hover:text-red-600 disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="label"
            placeholder="Label (e.g. Trade License)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
          />
          <input
            type="file"
            name="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            required
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !fileName}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="mt-2 text-sm text-green-700">Document uploaded.</p>}
    </section>
  )
}
