'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import AnimatedLogo from '@/components/AnimatedLogo'
import { login, requestOtp, verifyOtp, type LoginState, type OtpState } from '@/app/(auth)/actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'
const btnCls =
  'w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60'

function EyeButton({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-[#0E7490]"
    >
      {shown ? (
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
  )
}

function PasswordForm({ next, onUseOtp }: { next?: string; onUseOtp: () => void }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})
  const [showPw, setShowPw] = useState(false)
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
          <div className="relative">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              required
              className={`${inputCls} pr-11`}
            />
            <EyeButton shown={showPw} onClick={() => setShowPw((v) => !v)} />
          </div>
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
                className={`${inputCls} text-center tracking-[0.4em]`}
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
    <main className="flex min-h-screen">
      {/* Brand panel — left, desktop only */}
      <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#0A2540] px-12 text-center lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative">
          <Link href="/" aria-label="Chemparts — home" className="block">
            <AnimatedLogo variant="dark" width={168} />
          </Link>
          <p className="mx-auto mt-10 max-w-xs text-sm leading-relaxed text-white/70">
            Analytical instruments, OEM spare parts and laboratory services across the Gulf — since
            2003.
          </p>
        </div>
      </aside>

      {/* Form panel — right (full width on mobile) */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 flex justify-center lg:hidden" aria-label="Chemparts — home">
            <img src="/images/logo.svg" alt="Chemparts" width={54} height={30} />
          </Link>

          <h1 className="mb-1 text-center text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mb-7 text-center text-sm text-slate-500">
            {mode === 'password'
              ? 'Sign in to your Chemparts account.'
              : 'Enter your email and we’ll send you a one-time sign-in code.'}
          </p>

          {mode === 'password' ? (
            <PasswordForm next={next} onUseOtp={() => setMode('otp')} />
          ) : (
            <OtpForm next={next} onUsePassword={() => setMode('password')} />
          )}

          <p className="mt-7 text-center text-sm text-slate-500">
            New customer?{' '}
            <Link href="/register" className="font-medium text-[#0E7490] underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
