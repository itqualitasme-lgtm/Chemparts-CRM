'use client'

import { useState, useTransition } from 'react'
import { updateOrder } from '../actions'

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'CLOSED', 'CANCELLED']

export default function OrderStatusForm({
  orderId,
  status,
  notes,
}: {
  orderId: string
  status: string
  notes: string
}) {
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      action={(fd) =>
        start(async () => {
          setSaved(false)
          setError(null)
          const res = await updateOrder(orderId, fd)
          if (res.error) setError(res.error)
          else setSaved(true)
        })
      }
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-[200px_1fr] sm:items-start"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
        <select name="status" defaultValue={status} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900">
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Internal notes</span>
        <textarea name="notes" rows={2} defaultValue={notes} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60">
          {pending ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-sm text-green-700">Saved.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  )
}
