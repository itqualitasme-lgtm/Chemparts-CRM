import { Suspense } from 'react'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import SiteChrome from '@/components/site/SiteChrome'
import RouteAnimations from '@/components/site/RouteAnimations'

// SiteHeader reads the session cookie, so this shell must render per-request.
export const dynamic = 'force-dynamic'

// Persistent shell for the marketing site. Header, footer and the base scripts
// (SiteChrome) render ONCE and survive client-side navigation between the pages
// in this route group, so switching menu items is an instant transition with no
// white flash and no script re-download. RouteAnimations re-runs the ported
// site's content animations after each navigation.
//
// The per-page catalog scripts are loaded here too so their init functions are
// always available for RouteAnimations to call, no matter which page the user
// first landed on.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      {children}

      <SiteFooter />

      <SiteChrome extraScripts={['/assets/js/products-page.js', '/assets/js/product-detail.js']} />

      <Suspense fallback={null}>
        <RouteAnimations />
      </Suspense>
    </>
  )
}
