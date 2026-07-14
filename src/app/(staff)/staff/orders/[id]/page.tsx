import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePortal, getSessionUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'
import OrderStatusForm from './OrderStatusForm'
import OrderDocuments from './OrderDocuments'
import DeleteButton from '@/components/DeleteButton'
import { deleteOrder } from '../actions'

export const metadata = { title: 'Order - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params
  const [o, user] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        customer: { select: { companyName: true, id: true } },
        quotation: { select: { quotationNo: true, id: true } },
        items: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    }),
    getSessionUser(),
  ])
  if (!o) notFound()

  const { subtotal, vat, total } = quoteTotals(
    o.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice) })),
    Number(o.vatPercent),
  )
  const m = (n: number) => `${o.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/staff/orders" className="text-sm text-slate-500 underline">← Back to orders</Link>
        <h1 className="mt-2 font-mono text-lg font-semibold text-slate-900">{o.orderNo}</h1>
        <p className="text-slate-500">
          {o.customer ? (
            <Link href={`/staff/customers/${o.customer.id}`} className="underline">{o.customer.companyName}</Link>
          ) : 'No customer'}
          {o.quotation ? (
            <> · from <Link href={`/staff/quotations/${o.quotation.id}`} className="font-mono underline">{o.quotation.quotationNo}</Link></>
          ) : null}
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2 font-medium">Item</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 text-right font-medium">Unit</th>
              <th className="px-4 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-800">{it.productName}</td>
                <td className="px-4 py-2 text-slate-600">{it.qty}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-600">{m(Number(it.unitPrice))}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-800">{m(it.qty * Number(it.unitPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto max-w-xs space-y-1 p-4 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{m(subtotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>VAT ({Number(o.vatPercent)}%)</span><span className="font-mono">{m(vat)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900"><span>Total</span><span className="font-mono">{m(total)}</span></div>
        </div>
      </section>

      <OrderStatusForm orderId={o.id} status={o.status} notes={o.notes ?? ''} />

      <OrderDocuments
        orderId={o.id}
        documents={o.documents.map((d) => ({ id: d.id, kind: d.kind, label: d.label, url: d.url }))}
      />

      {user?.role === 'ADMIN' && (
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-6">
          <h2 className="font-medium text-red-800">Danger zone</h2>
          <p className="mb-3 text-sm text-slate-600">Permanently delete this order and its documents.</p>
          <DeleteButton action={deleteOrder.bind(null, o.id)} label="Delete order" confirmText={`Delete ${o.orderNo}? This cannot be undone.`} />
        </div>
      )}
    </div>
  )
}
