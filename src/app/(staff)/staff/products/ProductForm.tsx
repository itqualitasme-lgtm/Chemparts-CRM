'use client'

import { useActionState, useState } from 'react'
import type { ProductState } from './actions'
import { PRODUCT_TYPES } from '@/lib/validation/product'
import { INDUSTRIES, TEST_TYPES } from '@/lib/taxonomy'

type Initial = {
  name?: string
  slug?: string
  brandId?: string
  type?: string
  desc?: string
  overview?: string
  standards?: string[]
  industries?: string[]
  testTypes?: string[]
  tags?: string[]
  newUntil?: string
  productType?: string
  sample?: string
  output?: string
  partnerStatus?: string
  warranty?: string
  service?: string
  datasheetUrl?: string
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
  const [type, setType] = useState(initial.type ?? 'EQUIPMENT')
  const isEquipment = type === 'EQUIPMENT'

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
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
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

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Standards (comma-separated)</span>
        <input name="standards" defaultValue={initial.standards?.join(', ')} placeholder="ASTM, ISO, IP" className={inputCls} />
      </label>

      <fieldset className="rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Industries <span className="font-normal text-slate-400">— drives the website Industry filter</span>
        </legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {INDUSTRIES.map((i) => (
            <label key={i.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="industries" value={i.id} defaultChecked={initial.industries?.includes(i.id)} />
              {i.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Test types <span className="font-normal text-slate-400">— drives the website Test-type filter</span>
        </legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {TEST_TYPES.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="testTypes" value={t.id} defaultChecked={initial.testTypes?.includes(t.id)} />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

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

      {/* Specifications + commercial info shown on the public product page. */}
      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Specifications &amp; service <span className="font-normal text-slate-400">— shown on the product page</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Type / category</span>
            <input name="productType" defaultValue={initial.productType} placeholder="e.g. Petroleum Tester" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Sample compatibility</span>
            <input name="sample" defaultValue={initial.sample} placeholder="e.g. Liquids, solids (verify per method)" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Output / measurement</span>
            <input name="output" defaultValue={initial.output} placeholder="e.g. Per method specification" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Partner status</span>
            <input name="partnerStatus" defaultValue={initial.partnerStatus} placeholder="e.g. Authorized partner / Direct partner" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Warranty</span>
            <input name="warranty" defaultValue={initial.warranty} placeholder="e.g. 12 months / Manufacturer" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Service</span>
            <input name="service" defaultValue={initial.service} placeholder="e.g. In-region service & AMC" className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Spec sheet URL (Documentation)</span>
          <input name="datasheetUrl" type="url" defaultValue={initial.datasheetUrl} placeholder="https://…/datasheet.pdf" className={inputCls} />
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Model no. (optional)</span>
          <input name="modelNo" defaultValue={initial.modelNo} className={inputCls} />
        </label>
        {/* Equipment is enquiry/quote-only — no list price. Hidden for EQUIPMENT
            (and not submitted, so any stale price is cleared on save). */}
        {!isEquipment && (
          <>
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
          </>
        )}
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
