'use client'

import { useActionState, useState } from 'react'
import { requestPrice, type RequestPriceState } from './price-actions'

// Client island for the store's "Request current price" action. Lives in the
// (site) route group, which is EXCLUDED from Tailwind — so it's styled only with
// the ported site's own CSS classes (.field / .btn / .modal-ish inline) and
// inline styles. No Tailwind utilities here.

type Props = {
  productId: string
  loggedIn: boolean
  /** 'primary' → crimson accent (on_request); 'secondary' → ghost (indicative). */
  variant?: 'primary' | 'secondary'
  label?: string
}

export default function RequestPrice({ productId, loggedIn, variant = 'primary', label }: Props) {
  const [open, setOpen] = useState(false)
  const action = requestPrice.bind(null, productId)
  const [state, formAction, pending] = useActionState<RequestPriceState, FormData>(
    async (_prev, formData) => action(formData),
    {},
  )

  const btnClass = variant === 'primary' ? 'btn btn--accent' : 'btn btn--ghost btn--sm'
  const btnLabel = label ?? 'Request current price'

  if (state.ok) {
    return (
      <p
        className="mono"
        style={{
          fontSize: 13,
          color: 'var(--navy)',
          background: 'var(--bg-2)',
          border: '1px solid var(--rule-c)',
          borderRadius: 2,
          padding: '12px 14px',
          margin: 0,
        }}
        role="status"
      >
        Thanks — we&apos;ll confirm the current price and get back to you.
      </p>
    )
  }

  if (!open) {
    return (
      <button type="button" className={btnClass} onClick={() => setOpen(true)}>
        {btnLabel}
        
      </button>
    )
  }

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: 12,
        border: '1px solid var(--rule-c)',
        borderRadius: 2,
        padding: 16,
        background: 'white',
        maxWidth: 420,
      }}
    >
      <p className="mono text-muted" style={{ fontSize: 12, margin: 0 }}>
        Tell us the quantity you need and we&apos;ll confirm the current price.
      </p>

      <div className="field">
        <label htmlFor="rp-qty">Quantity</label>
        <input id="rp-qty" name="qty" type="number" min={1} defaultValue={1} required />
      </div>

      {!loggedIn || state.needContact ? (
        <>
          {state.needContact ? (
            <p className="mono text-muted" style={{ fontSize: 12, margin: 0 }}>
              Your session isn&apos;t active — add your name and email and we&apos;ll still send this through.
            </p>
          ) : null}
          <div className="field">
            <label htmlFor="rp-name">Your name</label>
            <input id="rp-name" name="guestName" type="text" placeholder="Full name" required />
          </div>
          <div className="field">
            <label htmlFor="rp-email">Email</label>
            <input id="rp-email" name="guestEmail" type="email" placeholder="you@company.com" required />
          </div>
        </>
      ) : null}

      <div className="field">
        <label htmlFor="rp-message">Message (optional)</label>
        <textarea id="rp-message" name="message" rows={3} placeholder="Any details that help us quote accurately" />
      </div>

      {state.error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>
          {state.error}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn--accent btn--sm" disabled={pending}>
          {pending ? 'Sending…' : 'Send request'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  )
}
