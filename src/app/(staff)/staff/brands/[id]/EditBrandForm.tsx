'use client'

import { useActionState } from 'react'
import { updateBrand, type BrandState } from '../actions'
import CountrySelect from '@/components/CountrySelect'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

type Brand = {
  name: string
  website: string | null
  email: string | null
  countryOfOrigin: string | null
  focus: string | null
  partnerSince: string | null
  description: string | null
  featured: boolean
  sortOrder: number
}

export default function EditBrandForm({ brandId, brand }: { brandId: string; brand: Brand }) {
  const [state, formAction, pending] = useActionState<BrandState, FormData>(
    updateBrand.bind(null, brandId),
    {},
  )

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved. The website is updated.</p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
        <input name="name" required defaultValue={brand.name} className={inputCls} />
        {state.fieldErrors?.name && (
          <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.name[0]}</span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Country of origin</span>
          <CountrySelect name="countryOfOrigin" defaultValue={brand.countryOfOrigin} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Partner since</span>
          <input name="partnerSince" defaultValue={brand.partnerSince ?? ''} className={inputCls} placeholder="2010 / IN-HOUSE" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Website</span>
          <input name="website" type="url" defaultValue={brand.website ?? ''} className={inputCls} placeholder="https://brand.com" />
          {state.fieldErrors?.website && (
            <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.website[0]}</span>
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Contact email</span>
          <input name="email" type="email" defaultValue={brand.email ?? ''} className={inputCls} placeholder="sales@brand.com" />
          {state.fieldErrors?.email && (
            <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.email[0]}</span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Focus</span>
        <input name="focus" defaultValue={brand.focus ?? ''} className={inputCls} placeholder="Petroleum testing — flash point, distillation" />
        <span className="mt-1 block text-xs text-slate-400">Shown under the brand name on the public partners page.</span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
        <textarea name="description" rows={3} defaultValue={brand.description ?? ''} className={inputCls} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Sort order</span>
          <input name="sortOrder" type="number" defaultValue={brand.sortOrder} className={inputCls} />
          <span className="mt-1 block text-xs text-slate-400">Lower shows first on the partners page.</span>
        </label>
        <label className="flex items-center gap-2 pt-7">
          <input type="checkbox" name="featured" defaultChecked={brand.featured} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">Featured brand</span>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
