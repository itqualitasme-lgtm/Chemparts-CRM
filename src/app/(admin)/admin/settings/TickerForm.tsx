'use client'

import { useActionState, useState } from 'react'
import { saveTicker, type TickerState } from './actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function TickerForm({ initial }: { initial: string[] }) {
  const [state, formAction, pending] = useActionState<TickerState, FormData>(saveTicker, {})
  const [items, setItems] = useState<string[]>(initial.length ? initial : [''])

  const update = (i: number, val: string) => setItems((xs) => xs.map((x, j) => (j === i ? val : x)))
  const remove = (i: number) => setItems((xs) => (xs.length === 1 ? [''] : xs.filter((_, j) => j !== i)))
  const add = () => setItems((xs) => [...xs, ''])

  // Reuse the existing `messages` action field: one message per line.
  const messages = items.map((s) => s.trim()).filter(Boolean).join('\n')

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <input type="hidden" name="messages" value={messages} />

      <div>
        <p className="text-sm font-medium text-slate-700">Header ticker messages</p>
        <p className="mt-1 text-[13px] text-slate-500">
          Each message scrolls in the dark strip at the very top of every public page. Use{' '}
          <code className="rounded bg-slate-100 px-1">{'{count}'}</code> to insert the live instrument count and{' '}
          <code className="rounded bg-slate-100 px-1">{'{brands}'}</code> for the brand count. Empty rows are ignored.
        </p>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Ticker updated — it’s live on the site.</p>}

      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
            <input
              value={it}
              onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. WORLDWIDE SHIPPING · export-packed · insured"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove message ${i + 1}`}
              className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          + Add message
        </button>
        <button type="submit" disabled={pending} className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60">
          {pending ? 'Saving…' : 'Save ticker'}
        </button>
      </div>
    </form>
  )
}
