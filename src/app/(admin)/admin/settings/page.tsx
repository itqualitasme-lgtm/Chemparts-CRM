import { db } from '@/lib/db'
import { getTickerMessages } from '@/lib/site-settings'
import TickerForm from './TickerForm'
import SalesPeople from './SalesPeople'

export const metadata = { title: 'Settings — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [ticker, people] = await Promise.all([
    getTickerMessages(),
    db.salesPerson.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      select: { id: true, name: true, email: true, phone: true, active: true },
    }),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500">Customise content and CRM options staff can edit without a developer.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Sales people</h2>
        <p className="mb-3 text-sm text-slate-500">Assign a sales person to customers, enquiries and quotations.</p>
        <SalesPeople people={people} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Header ticker</h2>
        <TickerForm initial={ticker} />
      </section>
    </div>
  )
}
