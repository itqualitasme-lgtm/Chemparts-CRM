'use client'

import { useActionState, useState } from 'react'
import { sendCampaign, type CampaignState } from './actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function CampaignForm({ activeCount }: { activeCount: number }) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(sendCampaign, {})
  const [confirming, setConfirming] = useState(false)

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirming) {
          e.preventDefault()
          setConfirming(true)
        }
      }}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h3 className="font-medium text-slate-800">New campaign</h3>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
        <input name="subject" required placeholder="New arrivals + spring offer" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
        <textarea name="body" required rows={10} placeholder={"Hi there,\n\nWe've just added…\n\nBlank lines start a new paragraph."} className={inputCls} />
        <span className="mt-1 block text-xs text-slate-400">Plain text. Blank lines become paragraphs. An unsubscribe link is added automatically.</span>
      </label>
      <button
        type="submit"
        disabled={pending || activeCount === 0}
        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${confirming ? 'bg-[#0E7490] hover:bg-[#0c637b]' : 'bg-[#0A2540] hover:bg-[#123a63]'}`}
        onClick={() => { if (state.error) setConfirming(false) }}
      >
        {pending ? 'Sending…' : confirming ? `Confirm — send to ${activeCount} subscriber${activeCount === 1 ? '' : 's'}` : `Send to ${activeCount} subscriber${activeCount === 1 ? '' : 's'}`}
      </button>
      {confirming && !pending ? (
        <button type="button" onClick={() => setConfirming(false)} className="ml-3 text-sm text-slate-500 underline">
          Cancel
        </button>
      ) : null}
    </form>
  )
}
