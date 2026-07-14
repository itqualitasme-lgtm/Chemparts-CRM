import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import SalesPeople from './SalesPeople'

export const metadata = { title: 'Sales people - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function SalesPeoplePage() {
  await requirePortal('staff')
  const people = await db.salesPerson.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, email: true, phone: true, active: true },
  })

  return (
    <div>
      <h1 className="text-base font-semibold text-slate-900">Sales people</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-slate-500">Assign a sales person to customers, enquiries and quotations.</p>
      <SalesPeople people={people} />
    </div>
  )
}
