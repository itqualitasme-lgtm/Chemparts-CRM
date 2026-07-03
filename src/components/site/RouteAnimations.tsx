'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Bridges Next.js client-side navigation with the ported site's imperative
// animation code in /assets/js/app.js.
//
// app.js exposes window.__cpInit(): global handlers (mobile menu, quote modal,
// header scroll, ticker) bind ONCE and are guarded internally; the content
// animations (scroll-reveal, counters, stagger, hero rotator, product cards)
// re-run every call, re-scanning the current DOM. We invoke it on first mount
// AND after every pathname change so freshly navigated pages get their
// [data-reveal] content revealed instead of staying hidden.
//
// The per-page catalog scripts (products-page.js / product-detail.js) are also
// exposed as re-runnable inits and called for their matching routes.
declare global {
  interface Window {
    __cpInit?: () => void
    __cpProductsPageInit?: () => void
    __cpProductDetailInit?: () => void
  }
}

export default function RouteAnimations() {
  const pathname = usePathname()
  // Product-detail navigation changes only the ?slug= query, not the pathname,
  // so we also key on the slug to re-hydrate when moving between products.
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''

  useEffect(() => {
    // Scripts load with strategy="afterInteractive", so __cpInit may not exist
    // yet on the very first render. Retry on a short poll until it appears.
    let cancelled = false
    let tries = 0

    const run = () => {
      if (cancelled) return
      const init = typeof window !== 'undefined' ? window.__cpInit : undefined
      if (typeof init === 'function') {
        init()
        // Re-run the page-specific catalog scripts for their routes.
        if (pathname && pathname.startsWith('/products') && typeof window.__cpProductsPageInit === 'function') {
          window.__cpProductsPageInit()
        }
        if (pathname && pathname.startsWith('/product') && !pathname.startsWith('/products') && typeof window.__cpProductDetailInit === 'function') {
          window.__cpProductDetailInit()
        }
        return
      }
      if (tries++ < 60) {
        setTimeout(run, 50)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [pathname, slug])

  return null
}
