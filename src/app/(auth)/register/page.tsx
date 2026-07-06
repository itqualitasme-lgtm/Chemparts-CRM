'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { COUNTRIES } from '@/lib/countries'
import { registerCustomer, resendRegisterCode, type RegisterState } from './actions'
import { verifyOtp } from '../actions'
import type { LoginState } from '../actions'
import { CUSTOMER_PORTAL_ENABLED, MAINTENANCE_MESSAGE } from '@/lib/auth/portal-access'

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
  const [verState, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyOtp, {})
  const [resending, startResend] = useTransition()
  const [resent, setResent] = useState(false)

  // Maintenance: customer registration is closed for now.
  if (!CUSTOMER_PORTAL_ENABLED) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="Chemparts" width={52} height={28} className="mx-auto mb-4" />
          <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Customer portal — under maintenance</h1>
          <p className="mb-6 text-sm text-slate-600">{MAINTENANCE_MESSAGE}</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/971557566123"
              target="_blank"
              rel="noopener"
              className="rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77]"
            >
              WhatsApp our team
            </a>
            <Link href="/" className="text-sm font-medium text-[#0E7490] underline">
              Back to the website
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // After the account is created we email a code; verify it to finish sign-up.
  if (state.ok && state.email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <img src="/images/logo.svg" alt="Chemparts" width={52} height={28} className="mx-auto mb-4" />
          <h1 className="mb-2 text-center text-xl font-semibold text-[#0A2540]">Enter your code</h1>
          <p className="mb-5 text-center text-sm text-slate-600">
            We emailed a 6-digit code to <span className="font-medium">{state.email}</span>. Enter it to
            activate your account.
          </p>
          <form action={verifyAction} className="space-y-3">
            <input type="hidden" name="email" value={state.email} />
            <input
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              placeholder="123456"
              className={`${inputCls} text-center text-lg tracking-[0.4em]`}
            />
            {verState.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{verState.error}</p>}
            <button
              type="submit"
              disabled={verifying}
              className="w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60"
            >
              {verifying ? 'Verifying…' : 'Verify & sign in'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-500">
            Didn&apos;t get it?{' '}
            <button
              type="button"
              disabled={resending || resent}
              onClick={() => startResend(async () => { await resendRegisterCode(state.email!); setResent(true) })}
              className="font-medium text-[#0E7490] underline disabled:opacity-60"
            >
              {resent ? 'Code resent' : resending ? 'Resending…' : 'Resend code'}
            </button>
          </div>
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
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            No password needed — we&apos;ll email you a 6-digit code to sign in. You can add a password later from
            Account&nbsp;→&nbsp;Settings if you prefer.
          </p>

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
