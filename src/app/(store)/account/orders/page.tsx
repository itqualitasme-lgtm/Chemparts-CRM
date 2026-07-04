import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'

export const metadata = { title: 'My orders — Chemparts' }
export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
}
// Customers only see invoice + warranty (internal PO / delivery notes are hidden).
const DOC_LABEL: Record<string, string> = { INVOICE: 'Invoice', WARRANTY: 'Warranty' }

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function MyOrdersPage() {
  const user = await requirePortal('store')

  const orders = user.customerId
    ? await db.order.findMany({
        where: { customerId: user.customerId, status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNo: true,
          status: true,
          currency: true,
          vatPercent: true,
          createdAt: true,
          items: { orderBy: { sortOrder: 'asc' }, select: { productName: true, qty: true, unitPrice: true } },
          documents: {
            where: { kind: { in: ['INVOICE', 'WARRANTY'] } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, kind: true, label: true, url: true },
          },
        },
      })
    : []

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">My orders</h1>
      <p className="mb-6 text-slate-500">Your confirmed purchases, with invoices and warranty documents to download.</p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No orders yet. Once you accept a quotation and we confirm your order, it appears here with your invoice and warranty.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const { total } = quoteTotals(
              o.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice) })),
              Number(o.vatPercent),
            )
            const m = (n: number) => `${o.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            return (
              <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900">{o.orderNo}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status]}`}>{o.status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs text-slate-400">{fmtDate(o.createdAt)} · {m(total)}</span>
                </div>

                <ul className="mb-3 divide-y divide-slate-50 text-sm">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between py-1.5">
                      <span className="text-slate-800">{it.productName} <span className="text-slate-400">× {it.qty}</span></span>
                      <span className="font-mono text-slate-600">{m(it.qty * Number(it.unitPrice))}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {o.documents.length > 0 ? (
                    o.documents.map((d) => (
                      <a
                        key={d.id}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-[#0A2540] hover:bg-slate-50"
                      >
                        ↓ {DOC_LABEL[d.kind] ?? d.label}
                      </a>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Invoice and warranty will appear here once issued.</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
