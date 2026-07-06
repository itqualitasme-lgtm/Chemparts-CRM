'use client'

import { useActionState, useState } from 'react'
import { saveBranches, type BranchesState } from './actions'

export type BranchInput = {
  id: string
  name: string
  legal: string
  tagline: string
  address: string
  phone: string
  email: string
  web: string
  trn: string
  isDefault: boolean
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `b-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
  }
}

const blank = (): BranchInput => ({
  id: newId(), name: '', legal: '', tagline: '', address: '', phone: '', email: '', web: '', trn: '', isDefault: false,
})

export default function CompanyBranchesForm({ initial }: { initial: BranchInput[] }) {
  const [state, formAction, pending] = useActionState<BranchesState, FormData>(saveBranches, {})
  const [branches, setBranches] = useState<BranchInput[]>(initial.length ? initial : [blank()])

  const patch = (i: number, p: Partial<BranchInput>) =>
    setBranches((bs) => bs.map((b, idx) => (idx === i ? { ...b, ...p } : b)))
  const setDefault = (i: number) =>
    setBranches((bs) => bs.map((b, idx) => ({ ...b, isDefault: idx === i })))
  const add = () => setBranches((bs) => [...bs, blank()])
  const remove = (i: number) =>
    setBranches((bs) => {
      if (bs.length === 1) return bs
      const next = bs.filter((_, idx) => idx !== i)
      if (!next.some((b) => b.isDefault)) next[0].isDefault = true
      return next
    })

  const json = JSON.stringify(
    branches
      .filter((b) => b.name.trim())
      .map((b) => ({ ...b, name: b.name.trim() })),
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="branchesJson" value={json} />

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Company entities saved.</p>}

      {branches.map((b, i) => (
        <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="radio" name="defaultBranch" checked={b.isDefault} onChange={() => setDefault(i)} />
              Default entity
            </label>
            {branches.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-600 underline hover:text-red-700">
                Remove
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">Company name (letterhead)</span>
              <input value={b.name} onChange={(e) => patch(i, { name: e.target.value })} placeholder="Chemparts Middle East FZC" className={inputCls} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">Legal name (footer) — optional</span>
              <input value={b.legal} onChange={(e) => patch(i, { legal: e.target.value })} placeholder="Defaults to the company name" className={inputCls} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">Tagline</span>
              <input value={b.tagline} onChange={(e) => patch(i, { tagline: e.target.value })} className={inputCls} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-500">Address</span>
              <textarea value={b.address} onChange={(e) => patch(i, { address: e.target.value })} rows={2} placeholder="P.O. Box …, Emirate, UAE" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Phone</span>
              <input value={b.phone} onChange={(e) => patch(i, { phone: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Email</span>
              <input value={b.email} onChange={(e) => patch(i, { email: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Website</span>
              <input value={b.web} onChange={(e) => patch(i, { web: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">TRN (tax reg. no.)</span>
              <input value={b.trn} onChange={(e) => patch(i, { trn: e.target.value })} className={inputCls} />
            </label>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          + Add entity
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save entities'}
        </button>
      </div>
    </form>
  )
}
