'use client'

import { useState, useTransition } from 'react'
import { updateServiceRequest } from './actions'

const STATUSES = ['NEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function StatusForm({
  id,
  status,
  salesPersonId,
  salesPeople,
}: {
  id: string
  status: string
  salesPersonId: string | null
  salesPeople: { id: string; name: string }[]
}) {
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectCls =
    'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

  return (
    <form
      action={(fd) =>
        start(async () => {
          setSaved(false)
          setError(null)
          const res = await updateServiceRequest(id, fd)
          if (res.error) setError(res.error)
          else setSaved(true)
        })
      }
      className="flex flex-wrap items-center gap-2"
    >
      <select name="status" defaultValue={status} className={selectCls}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
      <select name="salesPersonId" defaultValue={salesPersonId ?? ''} className={selectCls}>
        <option value="">Unassigned</option>
        {salesPeople.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>
      {saved && <span className="text-xs text-green-700">Saved</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  )
}
