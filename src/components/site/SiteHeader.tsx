import { getSessionUser } from '@/lib/auth/session'
import { homePathFor } from '@/lib/auth/rbac'
import { getCatalogCounts } from '@/lib/counts'
import { getCartCount } from '@/lib/cart'
import { getTickerMessages, getContactInfo } from '@/lib/site-settings'
import SiteHeaderClient from './SiteHeaderClient'

// Server component: fetches session + catalog counts + cart count (server-only
// data) and hands them to the client header, which derives the active nav item
// from the current pathname and renders Next <Link>s for instant navigation.
export default async function SiteHeader() {
  const [user, counts, cartCount, ticker, contact] = await Promise.all([
    getSessionUser(),
    getCatalogCounts(),
    getCartCount(),
    getTickerMessages(),
    getContactInfo(),
  ])
  const firstName = user ? (user.fullName || '').trim().split(/\s+/)[0] || user.email : ''

  return (
    <SiteHeaderClient
      instrumentCount={counts.instruments}
      brandCount={counts.brands}
      firstName={firstName}
      isAuthed={!!user}
      dashboardHref={user ? homePathFor(user.role) : '/'}
      cartCount={cartCount}
      ticker={ticker}
      phone={contact.phone}
      whatsapp={contact.whatsapp}
      whatsappDisplay={contact.whatsappDisplay}
    />
  )
}
