'use client'

import { useActionState } from 'react'
import type { CustomerState } from './actions'
import ContactPersonsEditor, { type ContactRow } from './ContactPersonsEditor'
import { INDUSTRY_OPTIONS, PAYMENT_TERMS_OPTIONS } from '@/lib/validation/customer'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const labelCls = 'mb-1 block text-sm font-medium text-slate-700'

export type CustomerDefaults = {
  companyName?: string
  country?: string
  city?: string | null
  address?: string | null
  trn?: string | null
  tradeLicense?: string | null
  industry?: string | null
  paymentTerms?: string | null
  creditLimit?: string | null
  currency?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  notes?: string | null
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  )
}

export default function CustomerForm({
  action,
  mode,
  defaults = {},
  initialContacts,
}: {
  action: (prev: CustomerState, fd: FormData) => Promise<CustomerState>
  mode: 'create' | 'edit'
  defaults?: CustomerDefaults
  initialContacts?: ContactRow[]
}) {
  const [state, formAction, pending] = useActionState<CustomerState, FormData>(action, {})
  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Customer saved.</p>}

      {/* Company */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-800">Company</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Company name *">
              <input name="companyName" required defaultValue={defaults.companyName ?? ''} className={inputCls} />
              {fe.companyName && <span className="mt-1 block text-sm text-red-600">{fe.companyName[0]}</span>}
            </Field>
          </div>
          <Field label="Country *">
            <input name="country" required defaultValue={defaults.country ?? 'United Arab Emirates'} className={inputCls} />
            {fe.country && <span className="mt-1 block text-sm text-red-600">{fe.country[0]}</span>}
          </Field>
          <Field label="City">
            <input name="city" defaultValue={defaults.city ?? ''} className={inputCls} placeholder="Dubai" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <textarea name="address" rows={2} defaultValue={defaults.address ?? ''} className={inputCls} />
            </Field>
          </div>
          <Field label="Industry">
            <select name="industry" defaultValue={defaults.industry ?? ''} className={inputCls}>
              <option value="">Select industry…</option>
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Website">
            <input name="website" defaultValue={defaults.website ?? ''} className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={defaults.phone ?? ''} className={inputCls} placeholder="+971 …" />
          </Field>
          <Field label="Company email">
            <input name="email" type="email" defaultValue={defaults.email ?? ''} className={inputCls} placeholder="info@company.com" />
            {fe.email && <span className="mt-1 block text-sm text-red-600">{fe.email[0]}</span>}
          </Field>
        </div>
      </section>

      {/* Registration & terms */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-slate-800">Registration &amp; payment terms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="VAT / TRN number">
            <input name="trn" defaultValue={defaults.trn ?? ''} className={inputCls} placeholder="100xxxxxxxxxxxx" />
          </Field>
          <Field label="Trade licence number">
            <input name="tradeLicense" defaultValue={defaults.tradeLicense ?? ''} className={inputCls} />
          </Field>
          <Field label="Payment terms">
            <select name="paymentTerms" defaultValue={defaults.paymentTerms ?? ''} className={inputCls}>
              <option value="">Select terms…</option>
              {PAYMENT_TERMS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Credit limit">
              <input name="creditLimit" type="number" step="0.01" defaultValue={defaults.creditLimit ?? ''} className={inputCls} placeholder="0.00" />
            </Field>
            <Field label="Currency">
              <select name="currency" defaultValue={defaults.currency ?? 'AED'} className={inputCls}>
                {['AED', 'USD', 'QAR', 'EUR', 'SAR'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 font-medium text-slate-800">Contact persons</h2>
        <p className="mb-4 text-sm text-slate-500">Add every person you deal with — name and designation. Mark one as primary.</p>
        <ContactPersonsEditor initial={initialContacts} />
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <Field label="Internal notes">
          <textarea name="notes" rows={3} defaultValue={defaults.notes ?? ''} className={inputCls} placeholder="Anything the team should know…" />
        </Field>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Create customer' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
