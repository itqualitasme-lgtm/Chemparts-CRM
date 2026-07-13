import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import PurchaseOrders, { type PORow } from './PurchaseOrders'

export const metadata = { title: 'Purchase orders — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffPurchaseOrdersPage() {
  await requirePortal('staff')

  const [pos, vendors] = await Promise.all([
    db.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        poNo: true,
        status: true,
        currency: true,
        expectedDate: true,
        notes: true,
        createdAt: true,
        vendor: { select: { companyName: true } },
        items: { orderBy: { sortOrder: 'asc' }, select: { id: true, description: true, qty: true, unitCost: true } },
        bills: { select: { id: true, billNo: true, amount: true, status: true } },
      },
    }),
    db.vendor.findMany({ orderBy: { companyName: 'asc' }, select: { id: true, companyName: true, currency: true } }),
  ])

  const rows: PORow[] = pos.map((p) => ({
    id: p.id,
    poNo: p.poNo,
    status: p.status,
    currency: p.currency,
    vendor: p.vendor.companyName,
    expectedDate: p.expectedDate ? p.expectedDate.toISOString() : null,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map((it) => ({ id: it.id, description: it.description, qty: it.qty, unitCost: Number(it.unitCost) })),
    bills: p.bills.map((b) => ({ id: b.id, billNo: b.billNo, amount: Number(b.amount), status: b.status })),
  }))

  return (
    <div>
      <PageHeader title="Purchase orders" subtitle={`${rows.length} POs raised to vendors.`} />
      <PurchaseOrders rows={rows} vendors={vendors} />
    </div>
  )
}
