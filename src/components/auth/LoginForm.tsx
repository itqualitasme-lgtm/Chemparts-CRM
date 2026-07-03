'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type LoginState } from '@/app/(auth)/actions'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20'

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="mb-4 inline-flex items-center gap-2">
          <img src="/images/logo.svg" alt="Chemparts" width={44} height={22} />
          <span className="text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</span>
        </Link>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mb-6 text-sm text-slate-500">
          Customers, staff and partners — sign in to your account.
        </p>

        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <form action={formAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input name="email" type="email" required className={inputCls} placeholder="you@company.com" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input name="password" type="password" required className={inputCls} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#0E7490] py-2.5 font-medium text-white transition hover:bg-[#0b5f77] disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

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
