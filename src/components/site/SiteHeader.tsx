import { getSessionUser } from '@/lib/auth/session'
import { homePathFor } from '@/lib/auth/rbac'
import { getInstrumentCount } from '@/lib/counts'

type NavKey = 'home' | 'about' | 'products' | 'application' | 'partners' | 'contact'

export default async function SiteHeader({ activeNav }: { activeNav?: NavKey }) {
  const [user, instrumentCount] = await Promise.all([getSessionUser(), getInstrumentCount()])
  const firstName = user ? (user.fullName || '').trim().split(/\s+/)[0] || user.email : ''

  const current = (key: NavKey) => (activeNav === key ? { 'aria-current': 'page' as const } : {})

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header" data-scrolled="false">
        <div className="site-header__top" aria-hidden="true">
          <span className="topticker__live mono">LIVE · UAE</span>
          <div className="topticker__scroll">
            <div className="topticker__scroll-track">
              <span>AUTHORIZED PARTNER · Hitachi · Tanaka · Oxford Instruments · KEM</span>
              <span>ICV CERTIFIED · Approved for ADNOC group procurement</span>
              <span>{instrumentCount} ANALYTICAL INSTRUMENTS · 16 brand partners · in stock</span>
              <span>STANDARDS · ASTM · ISO · IP · referenced on every quote</span>
              <span>SAME WORKING-DAY RESPONSE · UAE · Qatar · across the Gulf</span>
              <span>OEM SPARE PARTS · held in regional stock · no 6-week waits</span>
              <span>TURNKEY LAB SOLUTIONS · design · install · calibrate · service</span>
              <span>ISO 9001 · 14001 · NABL traceable calibrations</span>
              <span>SHARJAH · ABU DHABI · DOHA · since 2003</span>
              <span>WHATSAPP +971 55 756 6123 · Get a quote in under 24 hours</span>
              <span>AUTHORIZED PARTNER · Hitachi · Tanaka · Oxford Instruments · KEM</span>
              <span>ICV CERTIFIED · Approved for ADNOC group procurement</span>
              <span>{instrumentCount} ANALYTICAL INSTRUMENTS · 16 brand partners · in stock</span>
              <span>STANDARDS · ASTM · ISO · IP · referenced on every quote</span>
              <span>SAME WORKING-DAY RESPONSE · UAE · Qatar · across the Gulf</span>
              <span>OEM SPARE PARTS · held in regional stock · no 6-week waits</span>
              <span>TURNKEY LAB SOLUTIONS · design · install · calibrate · service</span>
              <span>ISO 9001 · 14001 · NABL traceable calibrations</span>
              <span>SHARJAH · ABU DHABI · DOHA · since 2003</span>
              <span>WHATSAPP +971 55 756 6123 · Get a quote in under 24 hours</span>
            </div>
          </div>
          <span className="topticker__right mono">ISO 9001 · 14001 · ICV CERTIFIED</span>
        </div>
        <div className="site-header__main">
          <a className="brand" href="/" aria-label="Chemparts Middle East — home">
            <img className="brand__logo" src="/assets/images/logo.svg" alt="Chemparts Middle East FZC" width="76" height="38" />
            <span className="brand__name"><strong>CHEMPARTS</strong><span className="brand__name-flip" aria-label="Chemparts Middle East FZC and Chemparts Medical &amp; Laboratory Supplies"><span className="brand__name-flip__opt">MIDDLE EAST FZC</span><span className="brand__name-flip__opt">MEDICAL &amp; LABORATORY SUPPLIES</span></span></span>
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="/" {...current('home')}>Home</a>
            <a href="/about" {...current('about')}>About</a>
            <a href="/products" {...current('products')}>Products</a>
            <a href="/application" {...current('application')}>Application</a>
            <a href="/partners" {...current('partners')}>Partners</a>
            <a href="/contact" {...current('contact')}>Contact</a>
            <div className="nav__cta">
              <span className="nav__cta-label">— Take action</span>
              <button type="button" className="btn btn--accent" data-quote="">Get a quote <span className="arrow">&rarr;</span></button>
              <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp +971 55 756 6123 <span className="arrow">&rarr;</span></a>
            </div>
          </nav>
          <div className="header-cta">
            {user ? (
              <a className="btn btn--ghost btn--sm" href={homePathFor(user.role)} aria-label={`Signed in as ${firstName} — go to dashboard`}>{firstName}</a>
            ) : (
              <>
                <a className="btn btn--ghost btn--sm" href="/login">Sign in</a>
                <a className="btn btn--primary btn--sm" href="/register">Register</a>
              </>
            )}
            <a className="btn btn--ghost btn--sm header-cta__phone" href="tel:+97165574047">+971 6 5574047</a>
            <button type="button" className="btn btn--primary btn--sm" data-quote="">Get a quote <span className="arrow">→</span></button>
            <button className="btn menu-toggle" aria-expanded="false" aria-label="Open menu"><span></span></button>
          </div>
        </div>
      </header>
    </>
  )
}
