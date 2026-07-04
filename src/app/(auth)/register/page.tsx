'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { COUNTRIES } from '@/lib/countries'
import { registerCustomer, type RegisterState } from './actions'

const initialState: RegisterState = {}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'

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

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerCustomer, initialState)
  const [showPw, setShowPw] = useState(false)

  if (state.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <img src="/images/logo.svg" alt="Chemparts" width={52} height={28} className="mx-auto mb-4" />
          <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Check your email</h1>
          <p className="text-slate-600">
            We sent a verification link to your email address. Click it to activate your Chemparts
            account.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-[#0E7490] underline">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(10,37,64,0.18)]">
        <Link href="/" className="mb-4 inline-flex items-center gap-2" aria-label="Chemparts — home">
          <img src="/images/logo.svg" alt="Chemparts" width={48} height={26} />
          <span className="text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</span>
        </Link>
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
            <div className="relative">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                minLength={10}
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-[#0E7490]"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8" strokeLinecap="round" />
                    <path d="M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 9 7-.4 1-1.3 2.3-2.6 3.4M6.1 6.1C3.9 7.4 2.4 9.6 2 12c.6 1.6 2.7 5 7 6.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="mt-1 block text-xs text-slate-400">At least 10 characters.</span>
          </Field>

          <label className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              name="agreeTerms"
              value="yes"
              required
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0E7490] focus:ring-[#0E7490]/30"
            />
            <span className="text-sm text-slate-600">
              I agree to Chemparts&apos;{' '}
              <Link href="/terms" target="_blank" className="font-medium text-[#0E7490] underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="font-medium text-[#0E7490] underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {state.fieldErrors?.agreeTerms && (
            <span className="block text-sm text-red-600">{state.fieldErrors.agreeTerms[0]}</span>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#0E7490] underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
