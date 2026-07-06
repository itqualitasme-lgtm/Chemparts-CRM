import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import EnquiriesTable, { type EnquiryRow } from './EnquiriesTable'

export const metadata = { title: 'Enquiries — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffEnquiriesPage() {
  const user = await requirePortal('staff')
  const isAdmin = user.role === 'ADMIN'

  const enquiries = await db.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      enquiryNo: true,
      type: true,
      status: true,
      contactName: true,
      guestName: true,
      guestEmail: true,
      guestCompany: true,
      guestPhone: true,
      message: true,
      lostReason: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      salesPerson: { select: { name: true } },
      items: { select: { id: true, productName: true, qty: true, priceRequested: true } },
    },
  })

  const rows: EnquiryRow[] = enquiries.map((e) => ({
    id: e.id,
    enquiryNo: e.enquiryNo,
    type: e.type,
    status: e.status,
    who: e.customer?.companyName ?? e.guestName ?? 'Guest',
    contactName: e.contactName,
    contactBits: [e.guestEmail, e.guestCompany, e.guestPhone].filter((x): x is string => Boolean(x)),
    salesPerson: e.salesPerson?.name ?? null,
    message: e.message,
    lostReason: e.lostReason,
    createdAt: e.createdAt.toISOString(),
    items: e.items.map((it) => ({ id: it.id, productName: it.productName, qty: it.qty, priceRequested: it.priceRequested })),
  }))

  const newCount = rows.filter((e) => e.status === 'NEW').length

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Enquiries</h1>
          <p className="text-slate-500">
            {rows.length} total · {newCount} new {newCount === 1 ? 'enquiry' : 'enquiries'} awaiting review.
          </p>
        </div>
        <Link
          href="/staff/enquiries/new"
          className="shrink-0 rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]"
        >
          + New enquiry
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No enquiries yet. Website cart submissions and staff-logged enquiries will appear here.
        </div>
      ) : (
        <EnquiriesTable enquiries={rows} isAdmin={isAdmin} />
      )}
    </div>
  )
}
