'use client'

import { useState, useTransition } from 'react'

// Admin-only destructive action button. `action` is a bound server action that
// deletes the entity and either redirects (success) or returns { error }. Guards
// with a confirm() and surfaces any returned error inline.
export default function DeleteButton({
  action,
  label = 'Delete',
  confirmText = 'Are you sure? This cannot be undone.',
  className,
}: {
  action: () => Promise<{ error?: string } | void>
  label?: string
  confirmText?: string
  className?: string
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmText)) return
          setError(null)
          start(async () => {
            const res = await action()
            if (res?.error) setError(res.error)
          })
        }}
        className={
          className ??
          'rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60'
        }
      >
        {pending ? 'Deleting…' : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
