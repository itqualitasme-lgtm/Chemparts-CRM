'use client'

import { useActionState } from 'react'
import { saveContact, type ContactState } from './actions'
import type { ContactInfo } from '@/lib/site-settings'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function ContactForm({ initial }: { initial: ContactInfo }) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(saveContact, {})

  const field = (name: keyof ContactInfo, label: string, hint?: string) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input name={name} defaultValue={initial[name]} className={inputCls} />
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  )

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="font-medium text-slate-800">Contact details</h3>
        <p className="text-[13px] text-slate-500">Shown in the site header, footer and contact page.</p>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {field('phone', 'Phone')}
        {field('email', 'Email')}
        {field('whatsappDisplay', 'WhatsApp (display)', 'e.g. +971 55 756 6123')}
        {field('whatsapp', 'WhatsApp (digits)', 'Used for wa.me links — digits only')}
      </div>
      {field('hours', 'Business hours')}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save contact details'}
      </button>
    </form>
  )
}
