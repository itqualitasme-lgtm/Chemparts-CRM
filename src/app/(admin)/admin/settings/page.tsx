import { getTickerMessages } from '@/lib/site-settings'
import TickerForm from './TickerForm'

export const metadata = { title: 'Settings — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const ticker = await getTickerMessages()

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mb-6 text-slate-500">Customise site content that staff can edit without a developer.</p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Header ticker</h2>
      <TickerForm initial={ticker} />
    </div>
  )
}
