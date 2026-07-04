'use client'

import { useState, useTransition } from 'react'
import { updateQty, removeItem } from '@/lib/cart-actions'

// Qty stepper + remove for a single cart line. (site) group → NO Tailwind;
// styled with the ported site's CSS classes + inline styles only.

export default function CartLineControls({ itemId, qty }: { itemId: string; qty: number }) {
  const [value, setValue] = useState(qty)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function commit(next: number) {
    const q = Math.max(0, Math.floor(next))
    setValue(q < 1 ? 1 : q)
    setError(null)
    startTransition(async () => {
      const res = await updateQty(itemId, q)
      if (res.error) setError(res.error)
    })
  }

  function remove() {
    setError(null)
    startTransition(async () => {
      const res = await removeItem(itemId)
      if (res.error) setError(res.error)
    })
  }

  const stepBtn: React.CSSProperties = {
    width: 30,
    height: 30,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--rule-c)',
    background: 'white',
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: 1,
    color: 'var(--navy)',
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center' }} role="group" aria-label="Quantity">
          <button
            type="button"
            style={{ ...stepBtn, borderRadius: '2px 0 0 2px' }}
            onClick={() => commit(value - 1)}
            disabled={pending || value <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
            onBlur={(e) => commit(Math.floor(Number(e.target.value)) || 1)}
            aria-label="Quantity"
            style={{
              width: 46,
              height: 30,
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
            onClick={() => commit(value + 1)}
            disabled={pending}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="mono text-muted"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Remove
        </button>
      </div>
      {error ? (
        <p className="mono" style={{ fontSize: 11, color: 'var(--crimson)', margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
