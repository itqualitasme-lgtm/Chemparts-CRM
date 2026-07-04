'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { createEnquiry, type CreateEnquiryState } from '../actions'

type CustomerOpt = { id: string; companyName: string }
type ProductOpt = { id: string; name: string; brand: string; type: string }
type Line = { productId: string; name: string; brand: string; qty: number; note: string }

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const labelCls = 'mb-1 block text-sm font-medium text-slate-700'

const TYPES = [
  ['PHONE', 'Phone'],
  ['EMAIL', 'Email'],
  ['WHATSAPP', 'WhatsApp'],
  ['WALK_IN', 'Walk-in'],
  ['REFERRAL', 'Referral'],
  ['EXHIBITION', 'Exhibition'],
  ['TENDER', 'Tender'],
  ['WEBSITE', 'Website'],
  ['OTHER', 'Other'],
] as const

export default function EnquiryCreateForm({
  customers,
  products,
}: {
  customers: CustomerOpt[]
  products: ProductOpt[]
}) {
  const [state, formAction, pending] = useActionState<CreateEnquiryState, FormData>(createEnquiry, {})
  const [mode, setMode] = useState<'existing' | 'new'>(customers.length ? 'existing' : 'new')
  const [lines, setLines] = useState<Line[]>([])
  const [search, setSearch] = useState('')

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .filter((p) => !lines.some((l) => l.productId === p.id))
      .slice(0, 8)
  }, [search, products, lines])

  function addLine(p: ProductOpt) {
    setLines((ls) => [...ls, { productId: p.id, name: p.name, brand: p.brand, qty: 1, note: '' }])
    setSearch('')
  }
  function setQty(i: number, qty: number) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, qty: Math.max(1, Math.floor(qty) || 1) } : l)))
  }
  function setNote(i: number, note: string) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, note } : l)))
  }
  function removeLine(i: number) {
    setLines((ls) => ls.filter((_, idx) => idx !== i))
  }

  const itemsJson = JSON.stringify(lines.map((l) => ({ productId: l.productId, qty: l.qty, note: l.note })))

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="itemsJson" value={itemsJson} />
      <input type="hidden" name="customerMode" value={mode} />

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      {/* Channel + customer */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Enquiry type / channel</span>
            <select name="type" defaultValue="PHONE" className={inputCls}>
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Contact person (who enquired)</span>
            <input name="contactName" className={inputCls} placeholder="Name of the person" />
          </label>
        </div>

        <div className="mt-5">
          <div className="mb-3 inline-flex rounded-lg border border-slate-200 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`rounded-md px-3 py-1.5 ${mode === 'existing' ? 'bg-[#0A2540] text-white' : 'text-slate-600'}`}
            >
              Existing customer
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`rounded-md px-3 py-1.5 ${mode === 'new' ? 'bg-[#0A2540] text-white' : 'text-slate-600'}`}
            >
              New customer
            </button>
          </div>

          {mode === 'existing' ? (
            <label className="block">
              <span className={labelCls}>Customer</span>
              <select name="customerId" className={inputCls} defaultValue="">
                <option value="" disabled>Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-slate-400">
                Not listed?{' '}
                <button type="button" onClick={() => setMode('new')} className="underline">Create a new customer</button>
                {' '}or add full details in{' '}
                <Link href="/staff/customers/new" className="underline">Customers</Link>.
              </span>
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelCls}>New company name *</span>
                <input name="newCompanyName" className={inputCls} placeholder="Company / walk-in name" />
              </label>
              <label className="block">
                <span className={labelCls}>Country</span>
                <input name="newCountry" defaultValue="United Arab Emirates" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Email</span>
                <input name="newEmail" type="email" className={inputCls} placeholder="contact@company.com" />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelCls}>Phone</span>
                <input name="newPhone" className={inputCls} placeholder="+971 …" />
              </label>
              <p className="text-xs text-slate-400 sm:col-span-2">
                A basic customer record is created now — add trade licence, VAT, contacts and documents later in Customers.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Line items */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 font-medium text-slate-800">Products enquired</h2>
        <p className="mb-4 text-sm text-slate-500">Search and add the products this enquiry is about.</p>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls}
            placeholder="Search product name or brand…"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addLine(p)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-400">{p.brand}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {lines.map((l, i) => (
              <li key={l.productId} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-800">{l.name}</div>
                  <div className="text-xs text-slate-400">{l.brand}</div>
                  <input
                    value={l.note}
                    onChange={(e) => setNote(i, e.target.value)}
                    placeholder="Note (optional)"
                    className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <input
                  type="number"
                  min={1}
                  value={l.qty}
                  onChange={(e) => setQty(i, Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                  aria-label="Quantity"
                />
                <button type="button" onClick={() => removeLine(i)} className="text-sm text-slate-500 underline hover:text-red-600">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-400">
            No products added yet.
          </p>
        )}
      </section>

      {/* Message */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="block">
          <span className={labelCls}>Message / requirement</span>
          <textarea name="message" rows={3} className={inputCls} placeholder="What the customer asked for, deadlines, budget…" />
        </label>
      </section>

      <button
        type="submit"
        disabled={pending || lines.length === 0}
        className="rounded-lg bg-[#0A2540] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create enquiry'}
      </button>
    </form>
  )
}
