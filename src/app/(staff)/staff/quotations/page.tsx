import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'
import QuotationsTable, { type QuotationRow } from './QuotationsTable'

export const metadata = { title: 'Quotations — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffQuotationsPage() {
  await requirePortal('staff')

  const quotations = await db.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: {
      id: true,
      quotationNo: true,
      status: true,
      currency: true,
      vatPercent: true,
      validUntil: true,
      createdAt: true,
      shipping: true,
      otherCharges: true,
      customer: { select: { companyName: true } },
      enquiry: { select: { enquiryNo: true } },
      salesPerson: { select: { name: true } },
      items: { select: { qty: true, unitPrice: true, discountPct: true } },
    },
  })

  const rows: QuotationRow[] = quotations.map((q) => {
    const { total } = quoteTotals(
      q.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice), discountPct: Number(i.discountPct) })),
      Number(q.vatPercent),
      { shipping: Number(q.shipping), other: Number(q.otherCharges) },
    )
    return {
      id: q.id,
      quotationNo: q.quotationNo,
      customer: q.customer?.companyName ?? '—',
      sales: q.salesPerson?.name ?? '—',
      fromEnquiry: q.enquiry?.enquiryNo ?? '—',
      total: `${q.currency} ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: q.status,
      validUntil: q.validUntil ? fmtDate(q.validUntil) : null,
      createdAt: q.createdAt.toISOString(),
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Quotations</h1>
        <p className="text-slate-500">
          {rows.length} quotation{rows.length === 1 ? '' : 's'}. Create one from an enquiry to price it up.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No quotations yet. Open an enquiry and choose “Create quotation”.
        </div>
      ) : (
        <QuotationsTable rows={rows} />
      )}
    </div>
  )
}
