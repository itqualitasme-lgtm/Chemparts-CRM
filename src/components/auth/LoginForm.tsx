'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type LoginState } from '@/app/(auth)/actions'
import type { Portal } from '@/lib/auth/rbac'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function LoginForm({
  portal,
  title,
  subtitle,
  showRegister = false,
}: {
  portal: Portal
  title: string
  subtitle: string
  showRegister?: boolean
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login.bind(null, portal),
    {},
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</p>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mb-6 text-sm text-slate-500">{subtitle}</p>

        {state.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <form action={formAction} className="space-y-4">
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
            className="w-full rounded-lg bg-[#0A2540] py-2.5 font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {showRegister && (
          <p className="mt-6 text-center text-sm text-slate-500">
            New to Chemparts?{' '}
            <Link href="/register" className="font-medium text-[#0A2540] underline">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
