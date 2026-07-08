'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavKey = 'home' | 'about' | 'products' | 'application' | 'services' | 'partners' | 'contact'

export type SiteHeaderClientProps = {
  instrumentCount: number
  brandCount: number
  firstName: string
  isAuthed: boolean
  dashboardHref: string
  cartCount: number
  ticker: string[]
  phone: string
  whatsapp: string
  whatsappDisplay: string
}

// Derive the active nav key from the current pathname so the header can live
// in the persistent layout and stay correct across client-side navigation.
function navKeyForPath(pathname: string): NavKey | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/about')) return 'about'
  // /products AND /product both highlight "Products"
  if (pathname.startsWith('/products') || pathname.startsWith('/product')) return 'products'
  if (pathname.startsWith('/application')) return 'application'
  if (pathname.startsWith('/book-service')) return 'services'
  if (pathname.startsWith('/partners')) return 'partners'
  if (pathname.startsWith('/contact')) return 'contact'
  return null
}

export default function SiteHeaderClient({
  instrumentCount,
  brandCount,
  firstName,
  isAuthed,
  dashboardHref,
  cartCount,
  ticker,
  phone,
  whatsapp,
  whatsappDisplay,
}: SiteHeaderClientProps) {
  const pathname = usePathname() || '/'
  // Render the messages twice back-to-back so the marquee scrolls seamlessly.
  // "{count}" -> live instrument count, "{brands}" -> live brand count.
  const tickerRun = [...ticker, ...ticker].map((m) =>
    m.replace(/\{count\}/g, String(instrumentCount)).replace(/\{brands\}/g, String(brandCount)))
  const active = navKeyForPath(pathname)
  const current = (key: NavKey) => (active === key ? { 'aria-current': 'page' as const } : {})

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header" data-scrolled="false">
        <div className="site-header__top" aria-hidden="true">
          <span className="topticker__live mono">LIVE · GLOBAL</span>
          <div className="topticker__scroll">
            <div className="topticker__scroll-track">
              {tickerRun.map((msg, i) => (
                <span key={i}>{msg}</span>
              ))}
            </div>
          </div>
          <span className="topticker__right mono">ISO 9001 · 14001 · WORLDWIDE EXPORT</span>
        </div>
        <div className="site-header__main">
          <Link className="brand" href="/" aria-label="Chemparts Middle East — home">
            <img className="brand__logo" src="/assets/images/logo.svg" alt="Chemparts Middle East FZC" width="76" height="38" />
            <span className="brand__name"><strong>CHEMPARTS</strong><span className="brand__name-flip" aria-label="Chemparts Middle East FZC and Chemparts Medical &amp; Laboratory Supplies"><span className="brand__name-flip__opt">MIDDLE EAST FZC</span><span className="brand__name-flip__opt">MEDICAL &amp; LABORATORY SUPPLIES</span></span></span>
          </Link>
          <nav className="nav" aria-label="Primary">
            <Link href="/" {...current('home')}>Home</Link>
            <Link href="/about" {...current('about')}>About</Link>
            <Link href="/products" {...current('products')}>Products</Link>
            <Link href="/application" {...current('application')}>Application</Link>
            <Link href="/book-service" {...current('services')}>Services</Link>
            <Link href="/partners" {...current('partners')}>Partners</Link>
            <Link href="/contact" {...current('contact')}>Contact</Link>
            {/* Account group — only rendered inside the open mobile drawer (the
                header-cta versions are hidden on small screens). */}
            <div className="nav__cta nav__cta--account">
              <span className="nav__cta-label">— Account</span>
              <Link className="btn btn--ghost" href="/cart">
                Cart{cartCount > 0 ? ` (${cartCount})` : ''} <span className="arrow">&rarr;</span>
              </Link>
              {isAuthed ? (
                <Link className="btn btn--primary" href={dashboardHref}>
                  My account · {firstName} <span className="arrow">&rarr;</span>
                </Link>
              ) : (
                <>
                  <Link className="btn btn--ghost" href="/login">Sign in <span className="arrow">&rarr;</span></Link>
                  <Link className="btn btn--primary" href="/register">Register <span className="arrow">&rarr;</span></Link>
                </>
              )}
            </div>
            <div className="nav__cta">
              <span className="nav__cta-label">— Take action</span>
              <button type="button" className="btn btn--accent" data-quote="">Get a quote <span className="arrow">&rarr;</span></button>
              <a className="btn btn--whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">WhatsApp {whatsappDisplay} <span className="arrow">&rarr;</span></a>
            </div>
          </nav>
          <div className="header-cta">
            <Link
              className="btn btn--ghost btn--sm"
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? ` — ${cartCount} item${cartCount === 1 ? '' : 's'}` : ' — empty'}`}
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.5 4h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.3" fill="currentColor" />
                <circle cx="17" cy="20" r="1.3" fill="currentColor" />
              </svg>
              <span>Cart</span>
              {cartCount > 0 ? (
                <span
                  aria-hidden="true"
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 9,
                    background: 'var(--crimson)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: '18px',
                    textAlign: 'center',
                    display: 'inline-block',
                  }}
                  data-cart-count
                >
                  {cartCount}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  data-cart-count
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 9,
                    background: 'var(--crimson)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: '18px',
                    textAlign: 'center',
                    display: 'none',
                  }}
                >
                  0
                </span>
              )}
            </Link>
            {isAuthed ? (
              <Link className="btn btn--ghost btn--sm" href={dashboardHref} aria-label={`Signed in as ${firstName} — go to dashboard`}>{firstName}</Link>
            ) : (
              <>
                <Link className="btn btn--ghost btn--sm" href="/login">Sign in</Link>
                <Link className="btn btn--primary btn--sm" href="/register">Register</Link>
              </>
            )}
            <a className="btn btn--ghost btn--sm header-cta__phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
            <button type="button" className="btn btn--primary btn--sm" data-quote="">Get a quote <span className="arrow">→</span></button>
            <button className="btn menu-toggle" aria-expanded="false" aria-label="Open menu"><span></span></button>
          </div>
        </div>
      </header>
    </>
  )
}
