'use client'

import { useActionState } from 'react'
import { bookService, type BookServiceState } from './actions'

// (site) group → NO Tailwind. Styled with the ported site's own .field/.btn
// classes + inline styles.

const TYPES = [
  ['AMC', 'Annual Maintenance Contract (AMC)'],
  ['CALIBRATION', 'Calibration'],
  ['REPAIR', 'Repair'],
  ['INSTALLATION', 'Installation / commissioning'],
  ['CONSULTATION', 'Consultation / planning'],
  ['OTHER', 'Other'],
] as const

export default function BookServiceForm({ loggedIn }: { loggedIn: boolean }) {
  const [state, formAction, pending] = useActionState<BookServiceState, FormData>(bookService, {})

  if (state.ok && state.requestNo) {
    return (
      <div
        role="status"
        style={{ border: '1px solid var(--rule-c)', borderRadius: 2, padding: 24, background: 'var(--bg-2)', display: 'grid', gap: 8 }}
      >
        <span className="eyebrow">Request received</span>
        <h3 className="h-2" style={{ margin: 0 }}>Thanks — your request {state.requestNo} is logged.</h3>
        <p className="text-muted" style={{ margin: 0 }}>
          Our service team will reply with next steps, usually within the working day. Please quote{' '}
          <span className="mono">{state.requestNo}</span> in any follow-up.
        </p>
        <div style={{ marginTop: 8 }}>
          <a className="btn btn--ghost btn--sm" href="/products">Continue browsing →</a>
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      style={{ border: '1px solid var(--rule-c)', borderRadius: 2, padding: 24, background: 'white', display: 'grid', gap: 16 }}
    >
      <div className="field">
        <label htmlFor="svc-type">Service needed</label>
        <select id="svc-type" name="type" defaultValue="AMC">
          {TYPES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="svc-equipment">Equipment / instrument</label>
        <input id="svc-equipment" name="equipment" type="text" placeholder="e.g. Hitachi X-Supreme 8000, or describe it" />
      </div>

      {!loggedIn ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label htmlFor="svc-name">Your name</label>
            <input id="svc-name" name="name" type="text" placeholder="Full name" required />
          </div>
          <div className="field">
            <label htmlFor="svc-email">Email</label>
            <input id="svc-email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="svc-company">Company (optional)</label>
            <input id="svc-company" name="company" type="text" placeholder="Company name" />
          </div>
          <div className="field">
            <label htmlFor="svc-phone">Phone (optional)</label>
            <input id="svc-phone" name="phone" type="tel" placeholder="+971 …" />
          </div>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="svc-date">Preferred date (optional)</label>
        <input id="svc-date" name="preferredDate" type="date" />
      </div>

      <div className="field">
        <label htmlFor="svc-message">Details</label>
        <textarea id="svc-message" name="message" rows={3} placeholder="Location, number of units, method/standard, the issue you’re seeing…" />
      </div>

      {state.error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>{state.error}</p>
      ) : null}

      <div>
        <button type="submit" className="btn btn--accent" disabled={pending}>
          {pending ? 'Submitting…' : 'Request service'}
          {!pending ? <span className="arrow">→</span> : null}
        </button>
      </div>
    </form>
  )
}
