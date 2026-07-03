'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login, requestOtp, verifyOtp, type LoginState, type OtpState } from '@/app/(auth)/actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'
const btnCls =
  'w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60'

function PasswordForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
        <input name="email" type="email" required className={inputCls} placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
        <input name="password" type="password" required className={inputCls} />
      </label>
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

function OtpForm({ next }: { next?: string }) {
  const [reqState, requestAction, requesting] = useActionState<OtpState, FormData>(requestOtp, {})
  const [verState, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyOtp, {})
  const [email, setEmail] = useState('')
  const sent = reqState.sent

  return (
    <div className="space-y-4">
      {!sent ? (
        <form action={requestAction} className="space-y-4">
          {reqState.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{reqState.error}</p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@company.com"
            />
          </label>
          <button type="submit" disabled={requesting} className={btnCls}>
            {requesting ? 'Sending code…' : 'Email me a sign-in code'}
          </button>
        </form>
      ) : (
        <>
          <form action={verifyAction} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} />}
            <input type="hidden" name="email" value={reqState.email ?? email} />
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              We emailed a 6-digit code to {reqState.email ?? email}.
            </p>
            {verState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{verState.error}</p>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Sign-in code</span>
              <input
                name="token"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                className={`${inputCls} tracking-[0.4em]`}
                placeholder="123456"
              />
            </label>
            <button type="submit" disabled={verifying} className={btnCls}>
              {verifying ? 'Verifying…' : 'Verify & sign in'}
            </button>
          </form>
          <form action={requestAction} className="text-center">
            <input type="hidden" name="email" value={reqState.email ?? email} />
            <button type="submit" className="text-xs text-[#0E7490] underline">
              Resend code
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<'password' | 'otp'>('password')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="mb-4 inline-flex items-center gap-2">
          <img src="/images/logo.svg" alt="Chemparts" width={44} height={22} />
          <span className="text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</span>
        </Link>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mb-5 text-sm text-slate-500">
          Welcome back — access your quotations, orders and account.
        </p>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded-md py-1.5 font-medium transition ${mode === 'password' ? 'bg-white text-[#0A2540] shadow-sm' : 'text-slate-500'}`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`rounded-md py-1.5 font-medium transition ${mode === 'otp' ? 'bg-white text-[#0A2540] shadow-sm' : 'text-slate-500'}`}
          >
            Email code (OTP)
          </button>
        </div>

        {mode === 'password' ? <PasswordForm next={next} /> : <OtpForm next={next} />}

        <p className="mt-6 text-center text-sm text-slate-500">
          New customer?{' '}
          <Link href="/register" className="font-medium text-[#0E7490] underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Staff, vendor and manager accounts are created by your administrator.
        </p>
      </div>
    </main>
  )
}
