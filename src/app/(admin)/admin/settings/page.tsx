import { getTickerMessages, getContactInfo, getFaqs } from '@/lib/site-settings'
import { getCompanyBranches } from '@/lib/company'
import SettingsTabs from './SettingsTabs'

export const metadata = { title: 'Settings - Chemparts' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [ticker, branches, contact, faqs] = await Promise.all([getTickerMessages(), getCompanyBranches(), getContactInfo(), getFaqs()])

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Settings</h1>
      <p className="mb-6 text-slate-500">Customise site content that staff can edit without a developer.</p>

      <SettingsTabs contact={contact} branches={branches} faqs={faqs} ticker={ticker} />
    </div>
  )
}
