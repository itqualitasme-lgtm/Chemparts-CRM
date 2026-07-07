'use client'

import { useState, useTransition } from 'react'
import { addToQuote } from '@/lib/cart-actions'

// Client island: add an enquiry-only item (e.g. equipment) to the cart as a
// quote line. (site) group = no Tailwind; ported .btn classes + inline styles.
export default function AddToQuote({
  productId,
  variant = 'compact',
  label = 'Add to quote list',
}: {
  productId: string
  variant?: 'compact' | 'full'
  label?: string
}) {
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await addToQuote(productId, 1)
      if (res.error) {
        setError(res.error)
        return
      }
      setAdded(true)
      window.setTimeout(() => setAdded(false), 2200)
    })
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <button
        type="button"
        className={variant === 'full' ? 'btn btn--accent' : 'btn btn--accent btn--sm'}
        onClick={submit}
        disabled={pending}
      >
        {pending ? 'Adding…' : added ? 'Added to quote ✓' : label}
        {!pending && !added ? <span className="arrow">→</span> : null}
      </button>
      {error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
