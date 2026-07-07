import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import EnquiriesTable, { type EnquiryRow } from './EnquiriesTable'

export const metadata = { title: 'Enquiries — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffEnquiriesPage() {
  const user = await requirePortal('staff')
  const isAdmin = user.role === 'ADMIN'

  const [enquiries, salesPeople] = await Promise.all([
    db.enquiry.findMany({
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
        salesPersonId: true,
        customer: { select: { companyName: true } },
        salesPerson: { select: { name: true } },
        items: { select: { id: true, productName: true, qty: true, priceRequested: true } },
        quotations: { select: { id: true, quotationNo: true }, orderBy: { createdAt: 'desc' } },
      },
    }),
    db.salesPerson.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const rows: EnquiryRow[] = enquiries.map((e) => ({
    id: e.id,
    enquiryNo: e.enquiryNo,
    type: e.type,
    status: e.status,
    who: e.customer?.companyName ?? e.guestName ?? 'Guest',
    contactName: e.contactName,
    contactBits: [e.guestEmail, e.guestCompany, e.guestPhone].filter((x): x is string => Boolean(x)),
    salesPerson: e.salesPerson?.name ?? null,
    salesPersonId: e.salesPersonId ?? '',
    message: e.message,
    lostReason: e.lostReason,
    createdAt: e.createdAt.toISOString(),
    items: e.items.map((it) => ({ id: it.id, productName: it.productName, qty: it.qty, priceRequested: it.priceRequested })),
    quotations: e.quotations.map((qt) => ({ id: qt.id, quotationNo: qt.quotationNo })),
  }))

  const newCount = rows.filter((e) => e.status === 'NEW').length

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle={`${rows.length} total · ${newCount} new ${newCount === 1 ? 'enquiry' : 'enquiries'} awaiting review.`}
        action={
          <Link href="/staff/enquiries/new" className="rounded-md bg-[#0A2540] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#123a63]">
            + New enquiry
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-[13px] text-slate-500">
          No enquiries yet. Website cart submissions and staff-logged enquiries will appear here.
        </div>
      ) : (
        <EnquiriesTable enquiries={rows} isAdmin={isAdmin} salesPeople={salesPeople} />
      )}
    </div>
  )
}
