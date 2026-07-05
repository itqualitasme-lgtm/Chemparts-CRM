import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import SalesPeople from './SalesPeople'

export const metadata = { title: 'Sales people — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function SalesPeoplePage() {
  await requirePortal('staff')
  const people = await db.salesPerson.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, email: true, phone: true, active: true },
  })

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Sales people</h1>
      <p className="mb-6 text-slate-500">Assign a sales person to customers, enquiries and quotations.</p>
      <SalesPeople people={people} />
    </div>
  )
}
