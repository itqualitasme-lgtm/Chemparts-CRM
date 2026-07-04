'use client'

import { useActionState } from 'react'
import { submitEnquiry } from '@/lib/cart-actions'
import type { SubmitEnquiryState } from '@/lib/cart'

// Enquiry submission form for the cart. (site) group → NO Tailwind; styled with
// the ported site's own CSS classes (.field / .btn) + inline styles only.
// On success it swaps to a confirmation showing the generated enquiry number.

export default function EnquiryForm({ loggedIn }: { loggedIn: boolean }) {
  const [state, formAction, pending] = useActionState<SubmitEnquiryState, FormData>(
    async (_prev, formData) => submitEnquiry(formData),
    {},
  )

  if (state.ok && state.enquiryNo) {
    return (
      <div
        role="status"
        style={{
          border: '1px solid var(--rule-c)',
          borderRadius: 2,
          padding: 24,
          background: 'var(--bg-2)',
          display: 'grid',
          gap: 8,
        }}
      >
        <span className="eyebrow">Enquiry received</span>
        <h3 className="h-2" style={{ margin: 0 }}>
          Thanks — your enquiry {state.enquiryNo} has been received.
        </h3>
        <p className="text-muted" style={{ margin: 0 }}>
          Our team will reply with pricing and availability, usually within the working day. Please quote{' '}
          <span className="mono">{state.enquiryNo}</span> in any follow-up.
        </p>
        <div style={{ marginTop: 8 }}>
          <a className="btn btn--ghost btn--sm" href="/products">
            Continue browsing →
          </a>
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      style={{
        border: '1px solid var(--rule-c)',
        borderRadius: 2,
        padding: 24,
        background: 'white',
        display: 'grid',
        gap: 16,
      }}
    >
      <div>
        <span className="eyebrow">Submit as enquiry</span>
        <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 14 }}>
          There is no online payment yet. Send this cart as an enquiry and our team will confirm pricing,
          availability and next steps.
        </p>
      </div>

      {!loggedIn ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label htmlFor="enq-name">Your name</label>
            <input id="enq-name" name="guestName" type="text" placeholder="Full name" required />
          </div>
          <div className="field">
            <label htmlFor="enq-email">Email</label>
            <input id="enq-email" name="guestEmail" type="email" placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="enq-company">Company (optional)</label>
            <input id="enq-company" name="guestCompany" type="text" placeholder="Company name" />
          </div>
          <div className="field">
            <label htmlFor="enq-phone">Phone (optional)</label>
            <input id="enq-phone" name="guestPhone" type="tel" placeholder="+971 …" />
          </div>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="enq-message">Message (optional)</label>
        <textarea
          id="enq-message"
          name="message"
          rows={3}
          placeholder="Delivery location, required-by date, or anything that helps us quote"
        />
      </div>

      {state.error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>
          {state.error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn--accent" disabled={pending}>
          {pending ? 'Submitting…' : 'Submit enquiry'}
          {!pending ? <span className="arrow">→</span> : null}
        </button>
      </div>
    </form>
  )
}
