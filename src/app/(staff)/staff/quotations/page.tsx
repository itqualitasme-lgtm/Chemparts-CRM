import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'

export const metadata = { title: 'Quotations — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-amber-100 text-amber-800',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffQuotationsPage() {
  await requirePortal('staff')

  const quotations = await db.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      quotationNo: true,
      status: true,
      currency: true,
      vatPercent: true,
      validUntil: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      enquiry: { select: { enquiryNo: true } },
      items: { select: { qty: true, unitPrice: true } },
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Quotations</h1>
        <p className="text-slate-500">
          {quotations.length} quotation{quotations.length === 1 ? '' : 's'}. Create one from an enquiry to price it up.
        </p>
      </div>

      {quotations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No quotations yet. Open an enquiry and choose “Create quotation”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2.5 font-medium">Quotation</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Valid until</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => {
                const { total } = quoteTotals(
                  q.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice) })),
                  Number(q.vatPercent),
                )
                return (
                  <tr key={q.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{q.quotationNo}</td>
                    <td className="px-4 py-2.5 text-slate-600">{q.customer?.companyName ?? '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{q.enquiry?.enquiryNo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800">
                      {q.currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[q.status]}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{q.validUntil ? fmtDate(q.validUntil) : '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/staff/quotations/${q.id}`} className="text-[#0A2540] underline">Open</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
