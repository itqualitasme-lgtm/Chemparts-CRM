'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { COUNTRIES } from '@/lib/countries'
import { registerCustomer, type RegisterState } from './actions'

const initialState: RegisterState = {}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string
  name: string
  errors?: Record<string, string[]>
  children: React.ReactNode
}) {
  const error = errors?.[name]?.[0]
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerCustomer, initialState)

  if (state.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Check your email</h1>
          <p className="text-slate-600">
            We sent a verification link to your email address. Click it to activate your Chemparts
            account.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</p>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">
          Browse the store, request quotations and track your orders.
        </p>

        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <form action={formAction} className="space-y-4">
          <Field label="Full name" name="fullName" errors={state.fieldErrors}>
            <input name="fullName" required className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="Company" name="companyName" errors={state.fieldErrors}>
            <input name="companyName" required className={inputCls} placeholder="Company name" />
          </Field>
          <Field label="Company email" name="email" errors={state.fieldErrors}>
            <input name="email" type="email" required className={inputCls} placeholder="you@company.com" />
            <span className="mt-1 block text-xs text-slate-400">
              Use your official company email — personal addresses (Gmail, Yahoo…) aren&apos;t accepted.
            </span>
          </Field>
          <Field label="Phone (with country code)" name="phone" errors={state.fieldErrors}>
            <input name="phone" type="tel" required className={inputCls} placeholder="+971 55 000 0000" />
          </Field>
          <Field label="Country" name="country" errors={state.fieldErrors}>
            <select name="country" required defaultValue="" className={inputCls}>
              <option value="" disabled>
                Select your country
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Password" name="password" errors={state.fieldErrors}>
            <input name="password" type="password" required minLength={10} className={inputCls} />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#0A2540] py-2.5 font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#0A2540] underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
