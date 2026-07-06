'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { createClient, toggleClient, deleteClient, type ClientState } from './actions'

type Client = { id: string; name: string; logo: string | null; active: boolean }

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function Clients({ clients }: { clients: Client[] }) {
  const [state, formAction, pending] = useActionState<ClientState, FormData>(createClient, {})
  const [busy, startBusy] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setFileName(null)
    }
  }, [state.ok])

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium">Logo</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Shown</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex h-10 w-24 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                    {c.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo} alt={c.name} className="max-h-8 max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400">no logo</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startBusy(() => toggleClient(c.id, !c.active))}
                    className={`text-xs ${c.active ? 'text-green-700' : 'text-slate-400'} underline disabled:opacity-60`}
                  >
                    {c.active ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(`Remove ${c.name} from the clients list?`)) startBusy(() => deleteClient(c.id))
                    }}
                    className="text-sm text-slate-500 underline hover:text-red-600 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No clients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-medium text-slate-800">Add a client</h3>
        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Added.</p>}
        <input name="name" required placeholder="Client name" className={inputCls} />
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A2540] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#123a63]"
        />
        <p className="text-xs text-slate-400">Logo optional · PNG, JPEG, WEBP or SVG up to 5MB.{fileName ? ` · ${fileName}` : ''}</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add client'}
        </button>
      </form>
    </div>
  )
}
