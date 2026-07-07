import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import CampaignForm from './CampaignForm'

export const metadata = { title: 'Campaigns — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const STATUS_CLS: Record<string, string> = {
  SENT: 'bg-green-100 text-green-800',
  SENDING: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-slate-100 text-slate-600',
}

export default async function CampaignsPage() {
  await requirePortal('staff')
  const [activeCount, campaigns] = await Promise.all([
    db.subscriber.count({ where: { active: true } }),
    db.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ])

  return (
    <div>
      <h1 className="text-base font-semibold text-slate-900">Campaigns</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-slate-500">
        Send a promotion or offer to your {activeCount} active subscriber{activeCount === 1 ? '' : 's'}. Each email includes a one-click unsubscribe link.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2.5 font-medium">Subject</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Sent</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{c.subject}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{c.sentCount}/{c.recipientCount}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                    {(c.sentAt ?? c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No campaigns sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <CampaignForm activeCount={activeCount} />
      </div>
    </div>
  )
}
