'use client'

import { useTransition } from 'react'
import { toggleSubscriber, removeSubscriber } from './actions'

type Sub = { id: string; email: string; name: string | null; source: string | null; active: boolean; confirmedAt: string | null; createdAt: string }

// active === confirmed (only set true once the opt-in link is clicked).
// Pending = signed up but never confirmed; Unsubscribed = previously confirmed then opted out.
function statusOf(s: Sub): 'confirmed' | 'pending' | 'unsubscribed' {
  if (s.active) return 'confirmed'
  return s.confirmedAt ? 'unsubscribed' : 'pending'
}

export default function Subscribers({ subs }: { subs: Sub[] }) {
  const [busy, start] = useTransition()

  const confirmed = subs.filter((s) => s.active)
  const pending = subs.filter((s) => statusOf(s) === 'pending')

  function copyEmails() {
    // Only confirmed, opted-in addresses are campaign-safe.
    const list = confirmed.map((s) => s.email).join(', ')
    navigator.clipboard?.writeText(list)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <span className="text-sm text-slate-500">
          {confirmed.length} confirmed{pending.length ? ` · ${pending.length} pending` : ''} · {subs.length} total
        </span>
        <button type="button" onClick={copyEmails} className="text-xs font-medium text-[#0E7490] hover:underline">
          Copy confirmed emails
        </button>
      </div>
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
            <th className="px-4 py-2.5 font-medium">Email</th>
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Source</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2.5 font-medium text-slate-800">{s.email}</td>
              <td className="px-4 py-2.5 text-slate-600">{s.name || '—'}</td>
              <td className="px-4 py-2.5 text-slate-500">{s.source || '—'}</td>
              <td className="px-4 py-2.5">
                {statusOf(s) === 'pending' ? (
                  <span
                    title="Signed up but hasn't clicked the confirmation email yet — excluded from campaigns."
                    className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                  >
                    Pending
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => start(() => toggleSubscriber(s.id, !s.active))}
                    className={`text-xs underline disabled:opacity-60 ${s.active ? 'text-green-700' : 'text-slate-400'}`}
                  >
                    {s.active ? 'Confirmed' : 'Unsubscribed'}
                  </button>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { if (confirm(`Remove ${s.email}?`)) start(() => removeSubscriber(s.id)) }}
                  className="text-sm text-slate-500 underline hover:text-red-600 disabled:opacity-60"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {subs.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No subscribers yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
