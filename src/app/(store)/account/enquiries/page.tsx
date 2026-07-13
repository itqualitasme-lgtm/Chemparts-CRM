import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

export const metadata = { title: 'My enquiries — Chemparts' }
export const dynamic = 'force-dynamic'

// Customer-facing status labels — internal states are collapsed into ones that
// make sense to the person who sent the enquiry.
const STATUS: Record<string, { label: string; cls: string }> = {
  NEW: { label: 'Received', cls: 'bg-amber-100 text-amber-800' },
  UNDER_REVIEW: { label: 'In review', cls: 'bg-blue-100 text-blue-800' },
  QUOTED: { label: 'Quoted', cls: 'bg-indigo-100 text-indigo-800' },
  WON: { label: 'Confirmed', cls: 'bg-green-100 text-green-800' },
  LOST: { label: 'Closed', cls: 'bg-slate-200 text-slate-600' },
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function MyEnquiriesPage() {
  const user = await requirePortal('store')

  const enquiries = user.customerId
    ? await db.enquiry.findMany({
        // SPAM is never shown to the customer.
        where: { customerId: user.customerId, status: { not: 'SPAM' } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          enquiryNo: true,
          status: true,
          message: true,
          createdAt: true,
          items: { select: { id: true, productName: true, qty: true } },
          quotations: {
            where: { status: { in: ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] } },
            select: { id: true, quotationNo: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    : []

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">My enquiries</h1>
      <p className="mb-6 text-slate-500">Enquiries you&rsquo;ve sent us. We reply with pricing and availability, usually within the working day.</p>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          You haven&rsquo;t sent any enquiries yet.{' '}
          <Link href="/products" className="font-medium text-[#0E7490] hover:underline">Browse the store</Link> and add items to enquire.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => {
            const s = STATUS[e.status] ?? { label: e.status, cls: 'bg-slate-100 text-slate-600' }
            return (
              <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900">{e.enquiryNo}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">{fmtDate(e.createdAt)}</span>
                </div>

                <ul className="mt-3 divide-y divide-slate-100">
                  {e.items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                      <span className="text-slate-800">{it.productName}</span>
                      <span className="font-mono text-slate-500">× {it.qty}</span>
                    </li>
                  ))}
                  {e.items.length === 0 ? <li className="py-1.5 text-sm text-slate-400">General enquiry</li> : null}
                </ul>

                {e.message ? (
                  <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{e.message}</p>
                ) : null}

                {e.quotations.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.quotations.map((qt) => (
                      <Link
                        key={qt.id}
                        href="/account/quotations"
                        className="rounded-lg border border-[#0A2540] px-3 py-1.5 font-mono text-xs font-medium text-[#0A2540] transition hover:bg-[#0A2540] hover:text-white"
                      >
                        View quotation {qt.quotationNo} →
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
