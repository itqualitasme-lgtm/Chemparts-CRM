import { getSessionUser } from '@/lib/auth/session'
import PlaceholderCards from '@/components/PlaceholderCards'

export const metadata = { title: 'Administration — Chemparts' }

export default async function AdminPage() {
  const user = await getSessionUser()
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Administration — {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Company-wide controls and reports.</p>
      <PlaceholderCards
        items={[
          { title: 'Users & approvals', note: 'Staff, customer and vendor accounts — Phase 6' },
          { title: 'Settings', note: 'Letterheads, VAT, currencies, numbering, SMTP — Phase 6' },
          { title: 'Reports', note: 'Pipeline, win rate, sales, stock value — Phase 6' },
          { title: 'Audit log', note: 'Every price and status change traced — Phase 6' },
        ]}
      />
    </div>
  )
}
