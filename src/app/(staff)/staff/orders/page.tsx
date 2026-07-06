import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'
import PageHeader from '@/components/ui/PageHeader'
import OrdersTable, { type OrderRow } from './OrdersTable'

export const metadata = { title: 'Orders — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffOrdersPage() {
  await requirePortal('staff')

  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
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

  const rows: OrderRow[] = orders.map((o) => {
    const { total } = quoteTotals(o.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice) })), Number(o.vatPercent))
    return {
      id: o.id,
      orderNo: o.orderNo,
      customer: o.customer?.companyName ?? '—',
      fromQuote: o.quotation?.quotationNo ?? '—',
      total: `${o.currency} ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      docs: o._count.documents,
      status: o.status,
      date: fmtDate(o.createdAt),
      createdAt: o.createdAt.toISOString(),
    }
  })

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${rows.length} order${rows.length === 1 ? '' : 's'}. Create one from an accepted quotation, then attach the invoice, warranty and PO.`}
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-[13px] text-slate-500">
          No orders yet. Open a quotation and choose “Create order”.
        </div>
      ) : (
        <OrdersTable rows={rows} />
      )}
    </div>
  )
}
