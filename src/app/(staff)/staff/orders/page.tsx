import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'

export const metadata = { title: 'Orders — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffOrdersPage() {
  await requirePortal('staff')

  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      orderNo: true,
      status: true,
      currency: true,
      vatPercent: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      quotation: { select: { quotationNo: true } },
      items: { select: { qty: true, unitPrice: true } },
      _count: { select: { documents: true } },
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="text-slate-500">
          {orders.length} order{orders.length === 1 ? '' : 's'}. Create one from an accepted quotation, then attach the invoice, warranty and PO.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No orders yet. Open a quotation and choose “Create order”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Docs</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const { total } = quoteTotals(
                  o.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice) })),
                  Number(o.vatPercent),
                )
                return (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{o.orderNo}</td>
                    <td className="px-4 py-2.5 text-slate-600">{o.customer?.companyName ?? '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{o.quotation?.quotationNo ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800">
                      {o.currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{o._count.documents}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status]}`}>{o.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/staff/orders/${o.id}`} className="text-[#0A2540] underline">Open</Link>
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
