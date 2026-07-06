import Link from 'next/link'
import { getSessionUser } from '@/lib/auth/session'
import PlaceholderCards from '@/components/PlaceholderCards'

export const metadata = { title: 'My Account — Chemparts' }

export default async function AccountPage() {
  const user = await getSessionUser()
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Welcome, {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Your Chemparts account overview.</p>
      <PlaceholderCards
        items={[
          { title: 'Browse the store', note: 'Equipment, spare parts & consumables — Phase 2' },
          { title: 'My enquiries', note: 'Send and follow product enquiries — Phase 3' },
          { title: 'My quotations', note: 'View and accept quotations online — Phase 3' },
          { title: 'Order tracking', note: 'Live status: procurement, shipping, customs — Phase 4' },
        ]}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="font-medium text-slate-800">Account settings</h2>
          <p className="text-sm text-slate-500">
            You sign in with a one-time email code. Add a password if you’d rather use one.
          </p>
        </div>
        <Link
          href="/account/password"
          className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Set / change password →
        </Link>
      </div>
    </div>
  )
}
