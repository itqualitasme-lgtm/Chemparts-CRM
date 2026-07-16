'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/lib/cart-actions'

// Client island for the store's "Add to cart" action. Lives in the (site) route
// group, which is EXCLUDED from Tailwind — so it's styled only with the ported
// site's own CSS classes (.btn / .btn--accent) and inline styles. No Tailwind.

type Props = {
  productId: string
  /** 'compact' → card footer stepper; 'full' → PDP larger controls. */
  variant?: 'compact' | 'full'
}

export default function AddToCart({ productId, variant = 'compact' }: Props) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await addToCart(productId, qty)
      if (res.error) {
        setError(res.error)
        return
      }
      setAdded(true)
      setQty(1)
      window.setTimeout(() => setAdded(false), 2200)
    })
  }

  const stepBtn: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--rule-c)',
    background: 'white',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    color: 'var(--navy)',
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center' }} role="group" aria-label="Quantity">
          <button
            type="button"
            style={{ ...stepBtn, borderRadius: '2px 0 0 2px' }}
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            disabled={pending || qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => {
              const n = Math.floor(Number(e.target.value))
              setQty(Number.isFinite(n) && n >= 1 ? n : 1)
            }}
            aria-label="Quantity"
            style={{
              width: 48,
              height: 32,
              textAlign: 'center',
              border: '1px solid var(--rule-c)',
              borderLeft: 'none',
              borderRight: 'none',
              fontSize: 14,
              MozAppearance: 'textfield',
            }}
          />
          <button
            type="button"
            style={{ ...stepBtn, borderRadius: '0 2px 2px 0' }}
            onClick={() => setQty((n) => n + 1)}
            disabled={pending}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          className={variant === 'full' ? 'btn btn--accent' : 'btn btn--accent btn--sm'}
          onClick={submit}
          disabled={pending}
        >
          {pending ? 'Adding…' : added ? 'Added ✓' : 'Add to cart'}
          
        </button>
      </div>

      {error ? (
        <p className="mono" style={{ fontSize: 12, color: 'var(--crimson)', margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
