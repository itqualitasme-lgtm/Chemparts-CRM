import { getTickerMessages, getContactInfo, getFaqs } from '@/lib/site-settings'
import { getCompanyBranches } from '@/lib/company'
import TickerForm from './TickerForm'
import CompanyBranchesForm from './CompanyBranchesForm'
import ContactForm from './ContactForm'
import FaqForm from './FaqForm'

export const metadata = { title: 'Settings — Chemparts' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [ticker, branches, contact, faqs] = await Promise.all([getTickerMessages(), getCompanyBranches(), getContactInfo(), getFaqs()])

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Settings</h1>
      <p className="mb-6 text-slate-500">Customise site content that staff can edit without a developer.</p>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Contact details</h2>
        <ContactForm initial={contact} />
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Company entities</h2>
        <p className="mb-3 text-sm text-slate-500">
          The legal entities you issue quotations under. The default entity is used unless a quotation says otherwise.
        </p>
        <CompanyBranchesForm initial={branches} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">FAQ page</h2>
        <FaqForm initial={faqs} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Header ticker</h2>
        <TickerForm initial={ticker} />
      </section>
    </div>
  )
}
