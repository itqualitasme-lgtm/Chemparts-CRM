'use client'

import { useActionState, useState } from 'react'
import {
  changePassword,
  confirmPasswordOtp,
  sendPasswordOtp,
  type OtpStepState,
  type PwState,
} from './actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'
const btnCls =
  'rounded-lg bg-[#0E7490] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60'

function NewPasswordForm() {
  const [state, action, pending] = useActionState<PwState, FormData>(changePassword, {})
  if (state.ok) {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        Your password has been updated.
      </p>
    )
  }
  return (
    <form action={action} className="max-w-sm space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">New password</span>
        <input name="password" type="password" required minLength={10} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</span>
        <input name="confirm" type="password" required minLength={10} className={inputCls} />
      </label>
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? 'Saving…' : 'Update password'}
      </button>
    </form>
  )
}

function VerifyThenChange() {
  const [reqState, sendAction, sending] = useActionState<OtpStepState, FormData>(sendPasswordOtp, {})
  const [confState, confirmAction, confirming] = useActionState<OtpStepState, FormData>(
    confirmPasswordOtp,
    {},
  )
  const [verified, setVerified] = useState(false)

  if (verified || confState.verified) return <NewPasswordForm />

  return (
    <div className="max-w-sm space-y-4">
      <p className="text-sm text-slate-500">
        For your security, verify it’s you with a one-time code sent to your email. No current
        password needed.
      </p>
      {!reqState.sent ? (
        <form action={sendAction}>
          {reqState.error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{reqState.error}</p>
          )}
          <button type="submit" disabled={sending} className={btnCls}>
            {sending ? 'Sending…' : 'Email me a verification code'}
          </button>
        </form>
      ) : (
        <form
          action={confirmAction}
          onSubmit={() => setTimeout(() => setVerified(false), 0)}
          className="space-y-3"
        >
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            We emailed you a 6-digit code.
          </p>
          {confState.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{confState.error}</p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Verification code</span>
            <input
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className={`${inputCls} tracking-[0.4em]`}
              placeholder="000000"
            />
          </label>
          <button type="submit" disabled={confirming} className={btnCls}>
            {confirming ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function PasswordChangeForm({ graceActive }: { graceActive: boolean }) {
  return graceActive ? <NewPasswordForm /> : <VerifyThenChange />
}
