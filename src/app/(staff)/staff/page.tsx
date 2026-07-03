import { getSessionUser } from '@/lib/auth/session'
import PlaceholderCards from '@/components/PlaceholderCards'

export const metadata = { title: 'Staff Dashboard — Chemparts' }

export default async function StaffPage() {
  const user = await getSessionUser()
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Staff dashboard — {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Manage catalog, enquiries, quotations and orders.</p>
      <PlaceholderCards
        items={[
          { title: 'Products & brands', note: 'Upload equipment, spare parts, consumables — Phase 2' },
          { title: 'Enquiry desk', note: 'Detailed enquiry filing and assignment — Phase 3' },
          { title: 'Quotation builder', note: 'Branded quotes with images and letterhead PDF — Phase 3' },
          { title: 'Order updates', note: 'Customs, lead time and delivery stages — Phase 4' },
          { title: 'Customers', note: 'Register and enrich customer records — Phase 3' },
          { title: 'Stock', note: 'Goods in/out, low-stock alerts, vendor POs — Phase 5' },
        ]}
      />
    </div>
  )
}
