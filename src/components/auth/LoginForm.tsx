'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import AnimatedLogo from '@/components/AnimatedLogo'
import { login, requestOtp, verifyOtp, type LoginState, type OtpState } from '@/app/(auth)/actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'
const btnCls =
  'w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60'

function PasswordForm({ next, onUseOtp }: { next?: string; onUseOtp: () => void }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <>
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
      <button
        type="button"
        onClick={onUseOtp}
        className="mt-4 block w-full text-center text-sm font-medium text-[#0E7490] hover:underline"
      >
        Sign in with a one-time email code instead
      </button>
    </>
  )
}

function OtpForm({ next, onUsePassword }: { next?: string; onUsePassword: () => void }) {
  const [reqState, requestAction, requesting] = useActionState<OtpState, FormData>(requestOtp, {})
  const [verState, verifyAction, verifying] = useActionState<LoginState, FormData>(verifyOtp, {})
  const [email, setEmail] = useState('')
  const sent = reqState.sent

  return (
    <>
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
          <form action={requestAction} className="mt-2 text-center">
            <input type="hidden" name="email" value={reqState.email ?? email} />
            <button type="submit" className="text-xs text-[#0E7490] underline">
              Resend code
            </button>
          </form>
        </>
      )}
      <button
        type="button"
        onClick={onUsePassword}
        className="mt-4 block w-full text-center text-sm font-medium text-[#0E7490] hover:underline"
      >
        Back to password sign-in
      </button>
    </>
  )
}

export default function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<'password' | 'otp'>('password')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(10,37,64,0.18)]">
        <Link href="/" className="mb-5 flex justify-center" aria-label="Chemparts — home">
          <AnimatedLogo />
        </Link>
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          {mode === 'password'
            ? 'Sign in to your Chemparts account.'
            : 'Enter your email and we’ll send you a one-time sign-in code.'}
        </p>

        {mode === 'password' ? (
          <PasswordForm next={next} onUseOtp={() => setMode('otp')} />
        ) : (
          <OtpForm next={next} onUsePassword={() => setMode('password')} />
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          New customer?{' '}
          <Link href="/register" className="font-medium text-[#0E7490] underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
