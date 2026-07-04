'use client'

import { useActionState } from 'react'
import type { ProductState } from './actions'
import { PRODUCT_TYPES } from '@/lib/validation/product'

type Initial = {
  name?: string
  slug?: string
  brandId?: string
  type?: string
  desc?: string
  overview?: string
  standards?: string[]
  industries?: string[]
  tags?: string[]
  newUntil?: string
  modelNo?: string
  unit?: string
  listPrice?: number | null
  currency?: string
  featured?: boolean
  active?: boolean
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

const TYPE_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipment (enquiry only)',
  SPARE_PART: 'Spare part',
  CONSUMABLE: 'Consumable',
}

function Err({ errors, name }: { errors?: Record<string, string[]>; name: string }) {
  const e = errors?.[name]?.[0]
  return e ? <span className="mt-1 block text-sm text-red-600">{e}</span> : null
}

export default function ProductForm({
  action,
  brands,
  initial = {},
  submitLabel,
}: {
  action: (prev: ProductState, formData: FormData) => Promise<ProductState>
  brands: { id: string; name: string }[]
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<ProductState, FormData>(action, {})

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
        <input name="name" required defaultValue={initial.name} className={inputCls} />
        <Err errors={state.fieldErrors} name="name" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Brand</span>
          <select name="brandId" required defaultValue={initial.brandId ?? ''} className={inputCls}>
            <option value="" disabled>
              Select a brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <Err errors={state.fieldErrors} name="brandId" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Type</span>
          <select name="type" defaultValue={initial.type ?? 'EQUIPMENT'} className={inputCls}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Short description</span>
        <input name="desc" required defaultValue={initial.desc} className={inputCls} />
        <Err errors={state.fieldErrors} name="desc" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Overview (optional)</span>
        <textarea name="overview" rows={3} defaultValue={initial.overview} className={inputCls} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Standards (comma-separated)</span>
          <input name="standards" defaultValue={initial.standards?.join(', ')} placeholder="ASTM, ISO, IP" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Industries (comma-separated)</span>
          <input name="industries" defaultValue={initial.industries?.join(', ')} placeholder="petroleum, materials" className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Hashtags</span>
        <input
          name="tags"
          defaultValue={initial.tags?.map((t) => `#${t}`).join(' ')}
          placeholder="#xrf #petroleum #new-arrival"
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-slate-400">
          Space or comma separated. Tags are a hidden search index (not shown on the card).
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">New arrival until (optional)</span>
        <input name="newUntil" type="date" defaultValue={initial.newUntil} className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20" />
        <span className="mt-1 block text-xs text-slate-400">
          Shows a “New” badge and lists the product first until this date, then auto-expires. Leave blank for none.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Model no. (optional)</span>
          <input name="modelNo" defaultValue={initial.modelNo} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">List price (spares/consumables)</span>
          <input name="listPrice" type="number" step="0.01" min="0" defaultValue={initial.listPrice ?? ''} className={inputCls} />
          <Err errors={state.fieldErrors} name="listPrice" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Currency</span>
          <select name="currency" defaultValue={initial.currency ?? 'AED'} className={inputCls}>
            {['AED', 'USD', 'QAR', 'EUR'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" value="true" defaultChecked={initial.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="active" value="true" defaultChecked={initial.active ?? true} />
          Active (visible in store)
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
