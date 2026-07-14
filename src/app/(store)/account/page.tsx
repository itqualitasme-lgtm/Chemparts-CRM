import Link from 'next/link'
import { getSessionUser } from '@/lib/auth/session'

export const metadata = { title: 'My Account - Chemparts' }

const CARDS = [
  { title: 'Browse the store', note: 'Equipment, spare parts & consumables.', href: '/products' },
  { title: 'My enquiries', note: 'Send and follow your product enquiries.', href: '/account/enquiries' },
  { title: 'My quotations', note: 'View priced offers from our team.', href: '/account/quotations' },
  { title: 'My orders', note: 'Track order status and documents.', href: '/account/orders' },
]

export default async function AccountPage() {
  const user = await getSessionUser()
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Welcome, {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Your Chemparts account overview.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            <span className="mt-3 inline-block text-sm font-medium text-[#0E7490] group-hover:underline">Open →</span>
          </Link>
        ))}
      </div>

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
