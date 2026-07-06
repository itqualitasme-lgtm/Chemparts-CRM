'use client'

import { useActionState } from 'react'
import { submitContact, type ContactState } from './actions'

// (site) group → NO Tailwind. Styled with the ported site's own .field/.btn
// classes + inline styles.
export default function ContactForm({
  defaultName = '',
  defaultCompany = '',
  defaultEmail = '',
}: {
  defaultName?: string
  defaultCompany?: string
  defaultEmail?: string
} = {}) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(submitContact, {})

  if (state.ok && state.enquiryNo) {
    return (
      <div
        data-reveal
        role="status"
        style={{ border: '1px solid var(--rule-c)', borderRadius: 2, padding: 24, background: 'var(--bg-2)', display: 'grid', gap: 8 }}
      >
        <span className="eyebrow">Message received</span>
        <h3 className="h-2" style={{ margin: 0 }}>Thanks — logged as {state.enquiryNo}.</h3>
        <p className="text-muted" style={{ margin: 0 }}>
          Our team will reply within the working day. Please quote{' '}
          <span className="mono">{state.enquiryNo}</span> in any follow-up.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} data-reveal style={{ display: 'grid', gap: 16 }}>
      <div className="field"><label htmlFor="cf-name">Name</label><input id="cf-name" name="name" type="text" autoComplete="name" inputMode="text" required defaultValue={defaultName} /></div>
      <div className="field"><label htmlFor="cf-company">Company</label><input id="cf-company" name="company" type="text" autoComplete="organization" inputMode="text" defaultValue={defaultCompany} /></div>
      <div className="field"><label htmlFor="cf-email">Email</label><input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={defaultEmail} /></div>
      <div className="field"><label htmlFor="cf-phone">Phone (optional)</label><input id="cf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" /></div>
      <div className="field">
        <label htmlFor="cf-topic">Topic</label>
        <select id="cf-topic" name="topic">
          <option>Quote</option>
          <option>Service</option>
          <option>Application</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field"><label htmlFor="cf-message">Message</label><textarea id="cf-message" name="message" rows={5} required></textarea></div>
      <input type="text" name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {state.error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>{state.error}</p>
      ) : null}
      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? 'Sending…' : <>Send message <span className="arrow">→</span></>}
        </button>
        <a className="btn btn--ghost" href="mailto:info@chemparts-me.com">Or email instead</a>
      </div>
    </form>
  )
}
