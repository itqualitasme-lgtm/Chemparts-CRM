import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import Subscribers from './Subscribers'

export const metadata = { title: 'Subscribers — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  await requirePortal('staff')
  const rows = await db.subscriber.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, email: true, name: true, source: true, active: true, createdAt: true },
  })
  const subs = rows.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))

  return (
    <div>
      <h1 className="text-base font-semibold text-slate-900">Subscribers</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-slate-500">
        Newsletter signups from the website. Use “Copy active emails” to send a promotion or offer campaign.
      </p>
      <Subscribers subs={subs} />
    </div>
  )
}
