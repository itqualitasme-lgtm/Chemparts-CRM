'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// Reveals the "message sent" banner when the contact form redirects back with
// ?sent=1. Keyed on the search params so it re-evaluates after client-side
// navigation, not only on a full page load.
export default function ContactSuccessBanner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const banner = document.getElementById('success-banner')
    if (!banner) return
    if (searchParams.get('sent') === '1') banner.removeAttribute('hidden')
    else banner.setAttribute('hidden', '')
  }, [searchParams])

  return null
}
