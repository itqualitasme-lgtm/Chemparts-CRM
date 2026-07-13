import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import VendorBills, { type VendorBillRow } from './VendorBills'

export const metadata = { title: 'Bills — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function VendorBillsPage() {
  const user = await requirePortal('vendor')

  const [bills, pos] = user.vendorId
    ? await Promise.all([
        db.bill.findMany({
          where: { vendorId: user.vendorId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            billNo: true,
            amount: true,
            currency: true,
            status: true,
            note: true,
            dueDate: true,
            createdAt: true,
            fileUrl: true,
            po: { select: { poNo: true } },
          },
        }),
        // Bills are raised against confirmed/received POs.
        db.purchaseOrder.findMany({
          where: { vendorId: user.vendorId, status: { in: ['CONFIRMED', 'RECEIVED'] } },
          orderBy: { createdAt: 'desc' },
          select: { id: true, poNo: true },
        }),
      ])
    : [[], []]

  const rows: VendorBillRow[] = bills.map((b) => ({
    id: b.id,
    billNo: b.billNo,
    amount: Number(b.amount),
    currency: b.currency,
    status: b.status,
    note: b.note,
    dueDate: b.dueDate ? b.dueDate.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    poNo: b.po?.poNo ?? null,
    fileUrl: b.fileUrl,
  }))

  return (
    <div>
      <PageHeader title="Bills" subtitle="Submit invoices against your purchase orders and track their payment status." />
      <VendorBills rows={rows} pos={pos} linked={Boolean(user.vendorId)} />
    </div>
  )
}
