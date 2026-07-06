import { requirePortal, getSessionUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getActiveSalesPeople } from '@/lib/sales'
import { SERVICE_TYPE_LABEL } from '@/lib/service'
import StatusForm from './StatusForm'
import DeleteButton from '@/components/DeleteButton'
import { deleteServiceRequest } from './actions'

export const metadata = { title: 'Service requests — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ServiceRequestsPage() {
  const [user, requests, salesPeople] = await Promise.all([
    requirePortal('staff'),
    db.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
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
  const newCount = requests.filter((r) => r.status === 'NEW').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Service requests</h1>
        <p className="text-slate-500">
          {requests.length} total · {newCount} new · AMC, calibration, repair, installation and consultations.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No service requests yet. They arrive from the “Book a service” form on the website.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const who = r.customer?.companyName ?? r.guestCompany ?? r.guestName ?? 'Guest'
            const contact = [r.guestName, r.guestEmail, r.guestPhone].filter(Boolean).join(' · ')
            const equip = r.product?.name ?? r.equipment
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium text-slate-900">{r.requestNo}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {SERVICE_TYPE_LABEL[r.type] ?? r.type}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-medium">{who}</span>
                      {contact ? <span className="text-slate-400"> · {contact}</span> : null}
                    </p>
                    {equip ? (
                      <p className="text-sm text-slate-600"><span className="text-slate-400">Equipment:</span> {equip}</p>
                    ) : null}
                    {r.preferredDate ? (
                      <p className="text-sm text-slate-500">Preferred: {r.preferredDate.toLocaleDateString('en-GB')}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusForm id={r.id} status={r.status} salesPersonId={r.salesPersonId} salesPeople={salesPeople} />
                    {isAdmin && (
                      <DeleteButton
                        action={deleteServiceRequest.bind(null, r.id)}
                        label="Delete"
                        confirmText={`Delete ${r.requestNo}? This cannot be undone.`}
                        className="text-xs text-red-600 underline hover:text-red-700"
                      />
                    )}
                  </div>
                </div>
                {r.message ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span className="text-slate-400">Details:</span> {r.message}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
