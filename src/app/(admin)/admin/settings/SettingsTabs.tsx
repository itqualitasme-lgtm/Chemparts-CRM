'use client'

import { useState, type ComponentProps } from 'react'
import ContactForm from './ContactForm'
import CompanyBranchesForm from './CompanyBranchesForm'
import FaqForm from './FaqForm'
import TickerForm from './TickerForm'

const TABS = [
  { key: 'contact', label: 'Contact details' },
  { key: 'company', label: 'Company entities' },
  { key: 'faq', label: 'FAQ page' },
  { key: 'ticker', label: 'Header ticker' },
] as const

export default function SettingsTabs({
  contact,
  branches,
  faqs,
  ticker,
}: {
  contact: ComponentProps<typeof ContactForm>['initial']
  branches: ComponentProps<typeof CompanyBranchesForm>['initial']
  faqs: ComponentProps<typeof FaqForm>['initial']
  ticker: ComponentProps<typeof TickerForm>['initial']
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('contact')

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={active ? 'page' : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                active ? 'border-[#0A2540] text-[#0A2540]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'contact' && <ContactForm initial={contact} />}

      {tab === 'company' && (
        <div>
          <p className="mb-3 text-sm text-slate-500">
            The legal entities you issue quotations under. The default entity is used unless a quotation says otherwise.
          </p>
          <CompanyBranchesForm initial={branches} />
        </div>
      )}

      {tab === 'faq' && <FaqForm initial={faqs} />}

      {tab === 'ticker' && <TickerForm initial={ticker} />}
    </div>
  )
}
