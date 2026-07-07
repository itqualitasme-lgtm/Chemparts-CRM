'use client'

import { useActionState, useState } from 'react'
import { saveFaq, type FaqState } from './actions'
import type { Faq } from '@/lib/site-settings'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function FaqForm({ initial }: { initial: Faq[] }) {
  const [state, formAction, pending] = useActionState<FaqState, FormData>(saveFaq, {})
  const [items, setItems] = useState<Faq[]>(initial.length ? initial : [{ q: '', a: '' }])

  const update = (i: number, key: keyof Faq, val: string) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, [key]: val } : x)))
  const remove = (i: number) => setItems((xs) => xs.filter((_, j) => j !== i))
  const add = () => setItems((xs) => [...xs, { q: '', a: '' }])

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <input type="hidden" name="faqsJson" value={JSON.stringify(items)} />
      <p className="text-[13px] text-slate-500">Shown on the public FAQ page (/faq). Empty rows are ignored.</p>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}

      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Q{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-xs text-slate-500 underline hover:text-red-600">Remove</button>
            </div>
            <input value={it.q} onChange={(e) => update(i, 'q', e.target.value)} placeholder="Question" className={`${inputCls} mb-2 font-medium`} />
            <textarea value={it.a} onChange={(e) => update(i, 'a', e.target.value)} rows={3} placeholder="Answer" className={inputCls} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          + Add question
        </button>
        <button type="submit" disabled={pending} className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60">
          {pending ? 'Saving…' : 'Save FAQs'}
        </button>
      </div>
    </form>
  )
}
