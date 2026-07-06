'use client'

import { useActionState, useEffect, useRef, useTransition } from 'react'
import { createSalesPerson, toggleSalesPerson, type SalesState } from './actions'

type Sales = { id: string; name: string; email: string | null; phone: string | null; active: boolean }

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function SalesPeople({ people }: { people: Sales[] }) {
  const [state, formAction, pending] = useActionState<SalesState, FormData>(createSalesPerson, {})
  const [toggling, startToggle] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Contact</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{[p.email, p.phone].filter(Boolean).join(' · ') || '—'}</td>
                <td className="px-4 py-2.5">
                  {p.active ? (
                    <span className="text-xs text-green-700">Active</span>
                  ) : (
                    <span className="text-xs text-slate-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    disabled={toggling}
                    onClick={() => startToggle(() => toggleSalesPerson(p.id, !p.active))}
                    className="text-sm text-slate-500 underline hover:text-[#0A2540] disabled:opacity-60"
                  >
                    {p.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sales people yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-medium text-slate-800">Add a sales person</h3>
        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Added.</p>}
        <input name="name" required placeholder="Full name" className={inputCls} />
        <input name="email" type="email" placeholder="Email (optional)" className={inputCls} />
        <input name="phone" placeholder="Phone (optional)" className={inputCls} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  )
}
