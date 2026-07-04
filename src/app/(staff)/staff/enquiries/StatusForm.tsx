'use client'

import { useActionState } from 'react'
import { updateEnquiryStatus, type UpdateStatusState } from './actions'

const STATUSES = ['NEW', 'UNDER_REVIEW', 'QUOTED', 'WON', 'LOST'] as const

export default function StatusForm({ enquiryId, current }: { enquiryId: string; current: string }) {
  const [state, formAction, pending] = useActionState<UpdateStatusState, FormData>(
    async (_prev, formData) => updateEnquiryStatus(enquiryId, formData),
    {},
  )

  return (
    <form action={formAction} className="flex items-center gap-2">
      <label className="text-xs font-medium text-slate-500" htmlFor={`status-${enquiryId}`}>
        Status
      </label>
      <select
        id={`status-${enquiryId}`}
        name="status"
        defaultValue={current}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Update'}
      </button>
      {state.ok ? <span className="text-xs text-green-700">Saved</span> : null}
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  )
}
