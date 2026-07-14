import Link from 'next/link'
import { getSessionUser } from '@/lib/auth/session'
import { db } from '@/lib/db'

export const metadata = { title: 'Vendor Portal - Chemparts' }
export const dynamic = 'force-dynamic'

export default async function VendorPage() {
  const user = await getSessionUser()

  const [openPOs, submittedBills] = user?.vendorId
    ? await Promise.all([
        db.purchaseOrder.count({ where: { vendorId: user.vendorId, status: { in: ['SENT', 'CONFIRMED'] } } }),
        db.bill.count({ where: { vendorId: user.vendorId, status: 'SUBMITTED' } }),
      ])
    : [0, 0]

  const cards = [
    { title: 'Purchase orders', note: 'View POs from Chemparts and confirm the ones you can fulfil.', href: '/vendor/purchase-orders', badge: openPOs ? `${openPOs} open` : null },
    { title: 'Bills', note: 'Submit invoices against your POs and track payment status.', href: '/vendor/bills', badge: submittedBills ? `${submittedBills} submitted` : null },
  ]

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">
        Vendor portal — {user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mb-8 text-slate-500">Purchase orders and billing with Chemparts.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{c.title}</h2>
              {c.badge ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{c.badge}</span> : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">{c.note}</p>
            <span className="mt-3 inline-block text-sm font-medium text-[#0E7490] group-hover:underline">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
