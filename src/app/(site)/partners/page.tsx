import { db } from '@/lib/db'
import { brandLogoUrl } from '@/lib/brand-image'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Brand Partners — Authorized Distributor for Hitachi, Tanaka, Oxford & More | UAE & Gulf',
  description: 'Chemparts is the authorized regional distributor for Hitachi, Tanaka, Oxford Instruments, Scavini, Biolab and more across the UAE, Dubai, Qatar and the Gulf. Full warranty, genuine spares, factory-certified service.',
  alternates: { canonical: '/partners' },
}

// Partners page is rendered from the CRM `Brand` table — the single source of
// truth. Add or edit a brand in /staff/brands (name, logo, country, focus,
// partner-since, sort order) and it reflects here immediately. Brand cards and
// the quick wall keep the ported site's classes + data-reveal hooks so the
// existing scroll animations still run.

function filterHash(name: string): string {
  return encodeURIComponent(JSON.stringify({ b: [name] }))
}

function sinceLabel(partnerSince: string | null): string {
  if (!partnerSince) return ''
  return partnerSince.toUpperCase() === 'IN-HOUSE' ? 'IN-HOUSE' : `SINCE ${partnerSince}`
}

export default async function PartnersPage() {
  const brands = await db.brand.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      countryOfOrigin: true,
      focus: true,
      partnerSince: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  const brandHref = (b: { slug: string; name: string }) =>
    b.slug ? `/brands/${b.slug}` : `/products#${filterHash(b.name)}`

  const brandCount = brands.length

  return (
    <>
      <main id="main">
        <section className="section">
          <div className="container">
            <div className="coord">
              <span>006 / PARTNERS</span>
              <span>{brandCount} BRANDS</span>
              <span>AUTHORIZED REGIONAL DISTRIBUTOR</span>
            </div>
            <div className="about-hero about-hero--tall" data-reveal>
              <div className="about-hero__copy">
                <span className="eyebrow">Brand partners · Chemparts</span>
                <h1 className="h-display">Specialists, not <em>generalists</em>.</h1>
                <p className="body-lg">Chemparts represents specialist instrument manufacturers — chosen for category leadership, calibration support and long-term product roadmaps. Authorized regional partner status, factory training, and direct technical lines to every brand below.</p>
              </div>
              <figure className="about-hero__photo">
                <img src="/assets/images/photos/partner-handshake.jpg" alt="Long-term distribution agreements between Chemparts and its instrument-maker partners" loading="lazy" decoding="async" />
                <figcaption><span className="mono">— AUTHORIZED · LONG-TERM PARTNERS</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Quick brand wall (text-only mockup-style index) */}
        <section className="section section--tight section--slate">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Quick index</span>
                <h2 className="h-2">All {brandCount} <em>brand partners</em>.</h2>
              </div>
              <p className="section-head__sub">Hover for the year we became authorized regional distributor. Click any brand for catalog.</p>
            </div>
            <div className="partners-wall" data-reveal data-stagger>
              {brands.map((b) => (
                <a
                  key={b.id}
                  className="partners-wall__cell"
                  href={brandHref(b)}
                  data-since={sinceLabel(b.partnerSince)}
                >
                  {b.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Brand cards */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Brand index</span>
                <h2 className="h-1">Every <em>partner</em>, every catalog.</h2>
              </div>
              <p className="section-head__sub">Click a brand to see exactly which instruments we stock — pricing and lead-time on request.</p>
            </div>

            <div className="brand-cards" data-reveal data-stagger>
              {brands.map((b) => {
                const logo = brandLogoUrl(b.logo)
                const count = b._count.products
                return (
                  <a key={b.id} className="brand-card" href={brandHref(b)}>
                    <div className="brand-card__logo">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={`${b.name} logo`} loading="lazy" />
                      ) : (
                        <span className="brand-card__wordmark">{b.name}</span>
                      )}
                    </div>
                    <div className="brand-card__body">
                      <div className="brand-card__head">
                        <h3>{b.name}</h3>
                        <span className="brand-card__country mono">{b.countryOfOrigin ?? ''}</span>
                      </div>
                      <p className="brand-card__focus">
                        {b.focus || 'Specialist analytical and laboratory instrumentation.'}
                      </p>
                      <div className="brand-card__foot">
                        <span className="mono">
                          <strong>[{String(count).padStart(2, '0')}]</strong> instruments in catalog
                        </span>
                        <svg className="brand-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Why authorized matters */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Why authorized matters</span>
                <h2 className="h-2">Buying from an <em>authorized</em> partner.</h2>
              </div>
            </div>
            <div className="strengths-grid" data-reveal>
              <div className="strength">
                <span className="strength__num">— 01</span>
                <h3 className="strength__title">Full manufacturer warranty</h3>
                <p className="strength__desc">Every instrument ships with the maker&apos;s warranty intact. No grey-market voiding, no parallel-import gotchas.</p>
              </div>
              <div className="strength">
                <span className="strength__num">— 02</span>
                <h3 className="strength__title">Genuine spares &amp; consumables</h3>
                <p className="strength__desc">Direct access to OEM spare parts and consumables — held in regional stock, no 6-week lead times for a thermocouple.</p>
              </div>
              <div className="strength">
                <span className="strength__num">— 03</span>
                <h3 className="strength__title">Factory-certified service</h3>
                <p className="strength__desc">Our service engineers are factory-trained by each manufacturer. Calibrations and IQ/OQ/PQ are accepted by every Gulf auditor.</p>
              </div>
              <div className="strength">
                <span className="strength__num">— 04</span>
                <h3 className="strength__title">Method &amp; firmware roadmap</h3>
                <p className="strength__desc">We see new methods and firmware before they hit the public catalog. Your lab stays current, not catching up.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--tight cta-band">
          <div className="container cta-band__inner" data-reveal>
            <span className="eyebrow">Looking for a brand we don&apos;t list?</span>
            <h2 className="h-1">Talk to <em>us</em>.</h2>
            <p className="body-lg" style={{ textAlign: 'center' }}>We can often source instruments outside this catalog through our partner network. Tell us the manufacturer and model — we&apos;ll come back with options.</p>
            <div className="actions">
              <a className="btn btn--primary" href="/products">Browse instruments <span className="arrow">→</span></a>
              <a className="btn btn--ghost" href="/contact">Contact our team</a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
