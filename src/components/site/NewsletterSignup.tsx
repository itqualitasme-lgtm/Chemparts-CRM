'use client'

import { useActionState } from 'react'
import { subscribeNewsletter, type SubscribeState } from '@/app/(site)/newsletter-actions'

// (site) group → no Tailwind; styled inline + ported classes.
export default function NewsletterSignup() {
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(subscribeNewsletter, {})

  if (state.ok) {
    return (
      <p style={{ fontSize: 14, color: '#9fb3c8', marginTop: 8 }}>
        ✓ Almost there — check your inbox and click the link to confirm your subscription.
      </p>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      <input
        type="email"
        name="email"
        required
        placeholder="you@company.com"
        aria-label="Email address"
        style={{
          flex: '1 1 180px',
          minWidth: 0,
          padding: '9px 12px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: 14,
        }}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <button type="submit" className="btn btn--accent btn--sm" disabled={pending}>
        {pending ? 'Subscribing…' : 'Subscribe'}
      </button>
      {state.error ? (
        <p style={{ fontSize: 12, color: '#f4a6a6', width: '100%', margin: 0 }}>{state.error}</p>
      ) : null}
    </form>
  )
}
