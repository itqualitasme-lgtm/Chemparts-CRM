'use client'

import { useState, useTransition } from 'react'
import { createOrderFromQuotation } from '../../orders/actions'

/** Convert a quotation into an order (server action redirects to the order). */
export default function CreateOrderButton({ quotationId }: { quotationId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            const res = await createOrderFromQuotation(quotationId)
            if (res?.error) setError(res.error)
          })
        }
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? 'Creating order…' : 'Create order from this quotation →'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </span>
  )
}
