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
    </div>
  )
}
