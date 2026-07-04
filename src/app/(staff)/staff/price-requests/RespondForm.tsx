'use client'

import { useActionState } from 'react'
import { respondPrice, type RespondPriceState } from './actions'

export default function RespondForm({
  requestId,
  defaultCurrency,
  defaultPrice,
}: {
  requestId: string
  defaultCurrency: string
  defaultPrice: number | null
}) {
  const [state, formAction, pending] = useActionState<RespondPriceState, FormData>(
    async (_prev, formData) => respondPrice(requestId, formData),
    {},
  )

  if (state.ok) {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
        Price confirmed and customer marked as quoted.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Price</span>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultPrice ?? ''}
          required
          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Currency</span>
        <input
          name="currency"
          type="text"
          defaultValue={defaultCurrency}
          maxLength={3}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm uppercase focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Valid until</span>
        <input
          name="validUntil"
          type="date"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Confirm price'}
      </button>
      {state.error ? <span className="w-full text-xs text-red-600">{state.error}</span> : null}
    </form>
  )
}
