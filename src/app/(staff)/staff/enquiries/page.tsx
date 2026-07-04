import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import StatusForm from './StatusForm'

export const metadata = { title: 'Enquiries — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  QUOTED: 'bg-indigo-100 text-indigo-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-slate-100 text-slate-600',
}

export default async function StaffEnquiriesPage() {
  await requirePortal('staff')

  const enquiries = await db.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      enquiryNo: true,
      status: true,
      guestName: true,
      guestEmail: true,
      guestCompany: true,
      guestPhone: true,
      message: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      items: {
        select: { id: true, productName: true, qty: true, priceRequested: true, note: true },
      },
    },
  })

  const newCount = enquiries.filter((e) => e.status === 'NEW').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Enquiries</h1>
        <p className="text-slate-500">
          {enquiries.length} total · {newCount} new {newCount === 1 ? 'enquiry' : 'enquiries'} awaiting review.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No enquiries yet. Customer carts submitted from the store will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => {
            const who = e.customer?.companyName ?? e.guestName ?? 'Guest'
            const contactBits = [e.guestEmail, e.guestCompany, e.guestPhone].filter(Boolean)
            const itemCount = e.items.length
            return (
              <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-slate-900">{e.enquiryNo}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[e.status]}`}>
                        {e.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{fmtDate(e.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-medium">{who}</span>
                      {contactBits.length ? (
                        <span className="text-slate-400"> · {contactBits.join(' · ')}</span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-500">
                      {itemCount} {itemCount === 1 ? 'line item' : 'line items'}
                    </p>
                  </div>
                  <StatusForm enquiryId={e.id} current={e.status} />
                </div>

                {e.message ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span className="text-slate-400">Message:</span> {e.message}
                  </p>
                ) : null}

                <details className="mt-3 border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900">
                    View items
                  </summary>
                  <ul className="mt-2 divide-y divide-slate-100">
                    {e.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="text-slate-800">{it.productName}</span>
                        <span className="flex items-center gap-2">
                          {it.priceRequested ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                              price to confirm
                            </span>
                          ) : null}
                          <span className="font-mono text-slate-500">× {it.qty}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
