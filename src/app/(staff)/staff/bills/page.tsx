import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import BillsTable, { type BillRow } from './BillsTable'

export const metadata = { title: 'Bills - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffBillsPage() {
  await requirePortal('staff')

  const bills = await db.bill.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 300,
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
      vendor: { select: { companyName: true } },
      po: { select: { poNo: true } },
    },
  })

  const rows: BillRow[] = bills.map((b) => ({
    id: b.id,
    billNo: b.billNo,
    amount: Number(b.amount),
    currency: b.currency,
    status: b.status,
    note: b.note,
    dueDate: b.dueDate ? b.dueDate.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    vendor: b.vendor.companyName,
    poNo: b.po?.poNo ?? null,
    fileUrl: b.fileUrl,
  }))

  const pending = rows.filter((r) => r.status === 'SUBMITTED').length

  return (
    <div>
      <PageHeader title="Bills" subtitle={`${rows.length} vendor bills${pending ? ` · ${pending} awaiting approval` : ''}.`} />
      <BillsTable rows={rows} />
    </div>
  )
}
