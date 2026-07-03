import { getSessionUser } from '@/lib/auth/session'
import PlaceholderCards from '@/components/PlaceholderCards'

export const metadata = { title: 'Vendor Portal — Chemparts' }

export default async function VendorPage() {
  const user = await getSessionUser()
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Vendor portal — {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Purchase orders and billing with Chemparts.</p>
      <PlaceholderCards
        items={[
          { title: 'Purchase orders', note: 'View POs and confirm lead times — Phase 5' },
          { title: 'Submit bills', note: 'Upload invoices against POs — Phase 5' },
          { title: 'Payment status', note: 'Track verification and payment — Phase 5' },
        ]}
      />
    </div>
  )
}
