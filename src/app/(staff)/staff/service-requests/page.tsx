import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getActiveSalesPeople } from '@/lib/sales'
import { SERVICE_TYPE_LABEL } from '@/lib/service'
import PageHeader from '@/components/ui/PageHeader'
import ServiceRequestsTable, { type ServiceRow } from './ServiceRequestsTable'

export const metadata = { title: 'Service requests - Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtPref(d: Date | null): string | null {
  return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null
}

export default async function ServiceRequestsPage() {
  const [user, requests, salesPeople] = await Promise.all([
    requirePortal('staff'),
    db.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        requestNo: true,
        type: true,
        status: true,
        equipment: true,
        message: true,
        preferredDate: true,
        createdAt: true,
        guestName: true,
        guestEmail: true,
        guestCompany: true,
        guestPhone: true,
        salesPersonId: true,
        customer: { select: { companyName: true } },
        product: { select: { name: true } },
      },
    }),
    getActiveSalesPeople(),
  ])
  const isAdmin = user.role === 'ADMIN'

  const rows: ServiceRow[] = requests.map((r) => ({
    id: r.id,
    requestNo: r.requestNo,
    typeLabel: SERVICE_TYPE_LABEL[r.type] ?? r.type,
    status: r.status,
    who: r.customer?.companyName ?? r.guestCompany ?? r.guestName ?? 'Guest',
    contact: [r.guestName, r.guestEmail, r.guestPhone].filter(Boolean).join(' · ') || null,
    equipment: r.product?.name ?? r.equipment,
    message: r.message,
    preferredDate: fmtPref(r.preferredDate),
    salesPersonId: r.salesPersonId,
    createdAt: r.createdAt.toISOString(),
  }))

  const newCount = rows.filter((r) => r.status === 'NEW').length

  return (
    <div>
      <PageHeader
        title="Service requests"
        subtitle={`${rows.length} total · ${newCount} new · AMC, calibration, repair, installation and consultations.`}
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-[13px] text-slate-500">
          No service requests yet. They arrive from the “Book a service” form on the website.
        </div>
      ) : (
        <ServiceRequestsTable rows={rows} salesPeople={salesPeople} isAdmin={isAdmin} />
      )}
    </div>
  )
}
