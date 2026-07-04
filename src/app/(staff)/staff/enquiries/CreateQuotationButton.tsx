'use client'

import { useState, useTransition } from 'react'
import { createQuotationFromEnquiry } from '../quotations/actions'

/** Turns an enquiry into a DRAFT quotation (server action redirects to it). */
export default function CreateQuotationButton({ enquiryId }: { enquiryId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            const res = await createQuotationFromEnquiry(enquiryId)
            if (res?.error) setError(res.error)
          })
        }
        className="rounded-lg border border-[#0A2540] px-3 py-1.5 text-xs font-medium text-[#0A2540] transition hover:bg-[#0A2540] hover:text-white disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create quotation'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}
