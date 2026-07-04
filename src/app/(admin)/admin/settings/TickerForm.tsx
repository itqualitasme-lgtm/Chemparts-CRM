'use client'

import { useActionState } from 'react'
import { saveTicker, type TickerState } from './actions'

export default function TickerForm({ initial }: { initial: string[] }) {
  const [state, formAction, pending] = useActionState<TickerState, FormData>(saveTicker, {})

  return (
    <form action={formAction} className="max-w-2xl space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Ticker updated — it’s live on the site.</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Header ticker messages</span>
        <textarea
          name="messages"
          rows={12}
          defaultValue={initial.join('\n')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
        <span className="mt-1 block text-xs text-slate-400">
          One message per line. They scroll in the dark strip at the very top of every public page. Use{' '}
          <code className="rounded bg-slate-100 px-1">{'{count}'}</code> to insert the live instrument count.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save ticker'}
      </button>
    </form>
  )
}
