'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createBrand, type BrandState } from './actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function BrandForm() {
  const [state, formAction, pending] = useActionState<BrandState, FormData>(createBrand, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-medium text-slate-800">Add a brand</h2>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Brand added. Open it to upload a logo.</p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
        <input name="name" required className={inputCls} placeholder="e.g. Tanaka" />
        {state.fieldErrors?.name && (
          <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.name[0]}</span>
        )}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Country</span>
          <input name="countryOfOrigin" className={inputCls} placeholder="Japan" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Partner since</span>
          <input name="partnerSince" className={inputCls} placeholder="2010 / IN-HOUSE" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Website</span>
        <input name="website" type="url" className={inputCls} placeholder="https://brand.com" />
        {state.fieldErrors?.website && (
          <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.website[0]}</span>
        )}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
        <input name="email" type="email" className={inputCls} placeholder="sales@brand.com" />
        {state.fieldErrors?.email && (
          <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.email[0]}</span>
        )}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Focus (shown on website)</span>
        <input name="focus" className={inputCls} placeholder="Petroleum testing — flash point, distillation" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</span>
        <textarea name="description" rows={2} className={inputCls} placeholder="Short description" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add brand'}
      </button>
    </form>
  )
}
