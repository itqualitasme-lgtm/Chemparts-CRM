'use client'

import { useTransition } from 'react'
import { toggleSubscriber, removeSubscriber } from './actions'

type Sub = { id: string; email: string; name: string | null; source: string | null; active: boolean; createdAt: string }

export default function Subscribers({ subs }: { subs: Sub[] }) {
  const [busy, start] = useTransition()

  function copyEmails() {
    const list = subs.filter((s) => s.active).map((s) => s.email).join(', ')
    navigator.clipboard?.writeText(list)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <span className="text-sm text-slate-500">{subs.filter((s) => s.active).length} active · {subs.length} total</span>
        <button type="button" onClick={copyEmails} className="text-xs font-medium text-[#0E7490] hover:underline">
          Copy active emails
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
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => start(() => toggleSubscriber(s.id, !s.active))}
                  className={`text-xs underline disabled:opacity-60 ${s.active ? 'text-green-700' : 'text-slate-400'}`}
                >
                  {s.active ? 'Subscribed' : 'Unsubscribed'}
                </button>
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
