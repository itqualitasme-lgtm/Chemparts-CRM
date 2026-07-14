import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePortal, getSessionUser } from '@/lib/auth/session'
import { getActiveSalesPeople } from '@/lib/sales'
import { getCompanyBranches } from '@/lib/company'
import { db } from '@/lib/db'
import { productImageUrl } from '@/lib/product-image'
import QuotationEditor, { type Line } from './QuotationEditor'
import CreateOrderButton from './CreateOrderButton'
import DeleteButton from '@/components/DeleteButton'
import { deleteQuotation } from '../actions'

export const metadata = { title: 'Quotation - Chemparts Staff' }
export const dynamic = 'force-dynamic'

function toDateInput(d: Date | null): string {
  if (!d) return ''
  return d.toISOString().slice(0, 10)
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params
  const [q, user, salesPeople, branches, productRows, customers] = await Promise.all([
    db.quotation.findUnique({
      where: { id },
      include: {
        customer: { select: { companyName: true, id: true } },
        enquiry: { select: { enquiryNo: true } },
        order: { select: { id: true, orderNo: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    getSessionUser(),
    getActiveSalesPeople(),
    getCompanyBranches(),
    db.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, modelNo: true, listPrice: true, image: true },
    }),
    db.customer.findMany({ orderBy: { companyName: 'asc' }, select: { id: true, companyName: true, address: true, city: true, country: true } }),
  ])
  const customerList = customers.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    address: [c.companyName, c.address, [c.city, c.country].filter(Boolean).join(', ')].filter(Boolean).join('\n'),
  }))
  const products = productRows.map((p) => ({
    id: p.id,
    name: p.name,
    modelNo: p.modelNo,
    listPrice: p.listPrice != null ? Number(p.listPrice) : null,
    image: productImageUrl(p.image),
  }))
  if (!q) notFound()

  const lines: Line[] = q.items.map((it) => ({
    productId: it.productId,
    productName: it.productName,
    qty: it.qty,
    unitPrice: Number(it.unitPrice),
    discountPct: Number(it.discountPct),
    note: it.note ?? '',
    deliveryPeriod: it.deliveryPeriod ?? '',
  }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/quotations" className="text-sm text-slate-500 underline">← Back to quotations</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-lg font-semibold text-slate-900">{q.quotationNo}</h1>
          <a
            href={`/print/quotation/${q.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Print / PDF ↗
          </a>
          {q.publicToken ? (
            <a
              href={`/q/${q.publicToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Public link / QR ↗
            </a>
          ) : null}
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
          deliveryTerms: q.deliveryTerms ?? '',
          shipping: Number(q.shipping),
          otherCharges: Number(q.otherCharges),
          otherChargesLabel: q.otherChargesLabel ?? '',
          salesPersonId: q.salesPersonId ?? '',
          companyBranchId: q.companyBranchId ?? '',
          customerId: q.customerId ?? '',
          billingAddress: q.billingAddress ?? '',
          deliveryAddress: q.deliveryAddress ?? '',
        }}
        lines={lines}
        salesPeople={salesPeople}
        branches={branches.map((b) => ({ id: b.id, name: b.name, isDefault: b.isDefault }))}
        products={products}
        customers={customerList}
      />

      {/* Convert an accepted quotation into an order (or jump to the existing one). */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 font-medium text-slate-800">Order</h2>
        {q.order ? (
          <p className="text-sm text-slate-600">
            This quotation became order{' '}
            <Link href={`/staff/orders/${q.order.id}`} className="font-mono font-medium text-[#0A2540] underline">{q.order.orderNo}</Link>.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">Once the customer accepts, convert this quotation into an order to attach the invoice, warranty and PO.</p>
            <CreateOrderButton quotationId={q.id} />
          </>
        )}
      </div>

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
