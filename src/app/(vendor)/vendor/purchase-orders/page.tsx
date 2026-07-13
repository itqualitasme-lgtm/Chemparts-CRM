import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import VendorPOs, { type VendorPORow } from './VendorPOs'

export const metadata = { title: 'Purchase orders — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function VendorPurchaseOrdersPage() {
  const user = await requirePortal('vendor')

  const pos = user.vendorId
    ? await db.purchaseOrder.findMany({
        // Drafts stay internal to Chemparts staff.
        where: { vendorId: user.vendorId, status: { not: 'DRAFT' } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          poNo: true,
          status: true,
          currency: true,
          expectedDate: true,
          notes: true,
          createdAt: true,
          items: { orderBy: { sortOrder: 'asc' }, select: { id: true, description: true, qty: true, unitCost: true } },
        },
      })
    : []

  const rows: VendorPORow[] = pos.map((p) => ({
    id: p.id,
    poNo: p.poNo,
    status: p.status,
    currency: p.currency,
    expectedDate: p.expectedDate ? p.expectedDate.toISOString() : null,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    items: p.items.map((it) => ({ id: it.id, description: it.description, qty: it.qty, unitCost: Number(it.unitCost) })),
  }))

  return (
    <div>
      <PageHeader title="Purchase orders" subtitle="Orders Chemparts has raised to you. Confirm the ones you can fulfil." />
      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No purchase orders yet.
        </div>
      ) : (
        <VendorPOs rows={rows} />
      )}
    </div>
  )
}
