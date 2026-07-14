import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import Clients from './Clients'

export const metadata = { title: 'Clients - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  await requirePortal('staff')
  const clients = await db.client.findMany({
    orderBy: [{ active: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, logo: true, active: true },
  })

  return (
    <div>
      <h1 className="text-base font-semibold text-slate-900">Clients</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-slate-500">
        The “Trusted by” logo strip on the website homepage. Add a name (logo optional); hide or delete any entry.
      </p>
      <Clients clients={clients} />
    </div>
  )
}
