import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePortal, getSessionUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import QuotationEditor, { type Line } from './QuotationEditor'
import DeleteButton from '@/components/DeleteButton'
import { deleteQuotation } from '../actions'

export const metadata = { title: 'Quotation — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function toDateInput(d: Date | null): string {
  if (!d) return ''
  return d.toISOString().slice(0, 10)
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params
  const [q, user] = await Promise.all([
    db.quotation.findUnique({
      where: { id },
      include: {
        customer: { select: { companyName: true, id: true } },
        enquiry: { select: { enquiryNo: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    getSessionUser(),
  ])
  if (!q) notFound()

  const lines: Line[] = q.items.map((it) => ({
    productId: it.productId,
    productName: it.productName,
    qty: it.qty,
    unitPrice: Number(it.unitPrice),
    note: it.note ?? '',
  }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/quotations" className="text-sm text-slate-500 underline">← Back to quotations</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-slate-900">{q.quotationNo}</h1>
        </div>
        <p className="text-slate-500">
          {q.customer ? q.customer.companyName : 'No customer'} ·{' '}
          {q.enquiry ? <>from enquiry <span className="font-mono">{q.enquiry.enquiryNo}</span></> : 'manual'}
        </p>
      </div>

      <QuotationEditor
        quotationId={q.id}
        header={{
          status: q.status,
          currency: q.currency,
          vatPercent: Number(q.vatPercent),
          validUntil: toDateInput(q.validUntil),
          notes: q.notes ?? '',
          terms: q.terms ?? '',
        }}
        lines={lines}
      />

      {user?.role === 'ADMIN' && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50/40 p-6">
          <h2 className="font-medium text-red-800">Danger zone</h2>
          <p className="mb-3 text-sm text-slate-600">Permanently delete this quotation.</p>
          <DeleteButton
            action={deleteQuotation.bind(null, q.id)}
            label="Delete quotation"
            confirmText={`Delete ${q.quotationNo}? This cannot be undone.`}
          />
        </div>
      )}
    </div>
  )
}
