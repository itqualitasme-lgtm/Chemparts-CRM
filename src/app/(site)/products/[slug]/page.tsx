import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProductDetail,
  productImageUrl,
  humanizeIndustry,
  type ProductDetail,
  type CompatibleSpare,
} from '@/lib/catalog-db'
import { priceState, canAddToCart } from '@/lib/price'
import { getSessionUser } from '@/lib/auth/session'
import Gallery from './Gallery'
import RequestPrice from '../RequestPrice'
import AddToCart from '../AddToCart'

// DB-driven product detail page (PDP). Server component; the only client island
// is the gallery thumbnail switcher. Styling reuses the ported marketing site's
// own CSS classes (from /assets/css/styles.css) — the (site) group is excluded
// from Tailwind, so NO Tailwind utilities here.
//
// This is a DYNAMIC route ([slug]). It coexists with the STATIC section routes
// (/products/instruments|consumables|spare-parts) and the static /products
// index — Next.js resolves static segments before the dynamic one, so those
// pages always win over this catch-all.
export const dynamic = 'force-dynamic'

const CONTACT_EMAIL = 'info@chemparts-me.com'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductDetail(slug)
  if (!product) {
    return { title: 'Product not found — Chemparts Middle East' }
  }
  const title = `${product.name} · ${product.brand} — Chemparts Middle East`
  return {
    title,
    description: product.overview || product.desc,
    openGraph: { title, description: product.overview || product.desc },
  }
}

function formatPrice(currency: string, value: number): string {
  const n = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${currency} ${n}`
}

/** Gallery image list, resolved to usable <img src> values. */
function galleryImages(product: ProductDetail): string[] {
  const raw = product.images.length > 0 ? product.images : product.image ? [product.image] : []
  return raw.map((i) => productImageUrl(i)).filter((s): s is string => Boolean(s))
}

/** A mailto fallback so the quote/enquiry always works even without JS. */
function enquiryMailto(product: ProductDetail): string {
  const subject = `Enquiry — ${product.name} (${product.brand})`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

/** Price-state-aware commerce block shown in the info column. */
function InfoCta({ product, loggedIn }: { product: ProductDetail; loggedIn: boolean }) {
  const state = priceState(product)
  const mailto = enquiryMailto(product)

  // Listed (fresh, confirmed) → show price prominently.
  // Cart-eligible items get an Add-to-cart stepper; the rest keep the
  // existing request-this-item quote CTA.
  if (state.mode === 'listed') {
    const cartEligible = canAddToCart(product)
    return (
      <div className="pdp-info__cta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--navy)' }}>
          {formatPrice(state.currency, state.price!)}
        </span>
        {cartEligible ? (
          <>
            <AddToCart productId={product.id} variant="full" />
            <a className="btn btn--ghost btn--sm" href="/cart">
              View cart →
            </a>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn--accent" data-quote={product.slug}>
                Request this item <span className="arrow">→</span>
              </button>
              <a className="btn btn--ghost" href={mailto}>
                Email us
              </a>
            </div>
            <span className="mono text-muted" style={{ fontSize: 11 }}>
              Online ordering coming soon
            </span>
          </>
        )}
      </div>
    )
  }

  // Indicative → show price with a "confirm current price" note + secondary request.
  if (state.mode === 'indicative') {
    return (
      <div className="pdp-info__cta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--navy)' }}>
          {formatPrice(state.currency, state.price!)}
        </span>
        <span className="mono text-muted" style={{ fontSize: 12 }}>
          Indicative — confirm current price
        </span>
        <RequestPrice productId={product.id} loggedIn={loggedIn} variant="secondary" label="Request current price" />
      </div>
    )
  }

  // On request → no number; primary "Request current price".
  return (
    <div className="pdp-info__cta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)' }}>
        Price on request
      </span>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <RequestPrice productId={product.id} loggedIn={loggedIn} variant="primary" label="Request current price" />
        <a className="btn btn--ghost" href={mailto}>
          Email us
        </a>
      </div>
    </div>
  )
}

/** Quick-spec table (Type / Sample / Standards / Output), blank rows omitted. */
function QuickSpec({ product }: { product: ProductDetail }) {
  const rows: [string, string][] = []
  if (product.productType) rows.push(['Type', product.productType])
  if (product.modelNo) rows.push(['Model', product.modelNo])
  if (product.sample) rows.push(['Sample', product.sample])
  if (product.standards.length) rows.push(['Standards', product.standards.join(', ')])
  if (product.output) rows.push(['Output', product.output])
  if (rows.length === 0) return null
  return (
    <table className="spec-table">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <th>{k}</th>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Full specification table for the details section. */
function FullSpec({ product }: { product: ProductDetail }) {
  const rows: [string, string][] = []
  if (product.productType) rows.push(['Type', product.productType])
  if (product.modelNo) rows.push(['Model number', product.modelNo])
  if (product.sample) rows.push(['Sample compatibility', product.sample])
  if (product.standards.length) rows.push(['Standards', product.standards.join(', ')])
  if (product.output) rows.push(['Output / measurement', product.output])
  rows.push(['Brand', product.brand])
  if (product.brandCountry) rows.push(['Country of origin', product.brandCountry])
  if (product.industries.length) {
    rows.push(['Industry application', product.industries.map(humanizeIndustry).join(', ')])
  }
  if (product.warranty) rows.push(['Warranty', product.warranty])
  if (product.service) rows.push(['Service', product.service])
  return (
    <table className="spec-table">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <th>{k}</th>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** One compatible-spare row: image, name, brand, req pill, qty, included. */
function SpareItem({ s }: { s: CompatibleSpare }) {
  const src = productImageUrl(s.image)
  const required = s.requirement === 'REQUIRED'
  return (
    <a
      className="card"
      href={`/products/${encodeURIComponent(s.slug)}`}
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 12 }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          flex: '0 0 auto',
          border: '1px solid var(--rule-c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        {src ? (
          <img src={src} alt={s.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="card__brand">{s.brand}</span>
        <h3 className="card__title" style={{ fontSize: 16, margin: '2px 0 6px' }}>
          {s.name}
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={required ? 'pill pill--crimson' : 'pill'}>{required ? 'Required' : 'Optional'}</span>
          <span className="mono text-muted" style={{ fontSize: 12 }}>
            × {s.defaultQty}
          </span>
          {s.bundledFree ? (
            <span className="pill pill--accent" style={{ fontSize: 10 }}>
              Included
            </span>
          ) : null}
          {s.listPrice != null ? (
            <span className="mono text-muted" style={{ fontSize: 12 }}>
              {formatPrice(s.currency, s.listPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </a>
  )
}

/** Related-product card, reusing the slice-1 .card layout. */
function RelatedCard({
  p,
}: {
  p: { slug: string; name: string; brand: string; image: string | null; desc: string }
}) {
  const src = productImageUrl(p.image)
  return (
    <a className="card" href={`/products/${encodeURIComponent(p.slug)}`}>
      <div className="card__media">{src ? <img src={src} alt={p.name} loading="lazy" decoding="async" /> : null}</div>
      <div className="card__body">
        <span className="card__brand">{p.brand}</span>
        <h3 className="card__title">{p.name}</h3>
        <p className="card__desc">{p.desc}</p>
        <div className="card__foot">
          <span className="mono text-muted">View details</span>
          <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </div>
      </div>
    </a>
  )
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [product, user] = await Promise.all([getProductDetail(slug), getSessionUser()])
  if (!product) notFound()
  const loggedIn = user != null

  const images = galleryImages(product)
  const overviewText = product.overview || product.desc
  const isEquipment = product.type === 'EQUIPMENT'

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/">[HOME]</a>
            <span className="sep">/</span>
            <a href="/products">[PRODUCTS]</a>
            <span className="sep">/</span>
            <span>{product.name}</span>
          </p>

          <div className="pdp-layout">
            {images.length > 0 ? (
              <Gallery images={images} name={product.name} />
            ) : (
              <div className="pdp-gallery">
                <div className="pdp-gallery__main" />
              </div>
            )}

            <div className="pdp-info" data-reveal>
              {product.brandLogo ? (
                <span className="pdp-info__brand pdp-info__brand--logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.brandLogo} alt={product.brand} className="pdp-info__brandimg" />
                </span>
              ) : (
                <span className="pdp-info__brand">{product.brand}</span>
              )}
              <h1 className="pdp-info__title">{product.name}</h1>
              <p className="pdp-info__desc">{product.desc}</p>

              <QuickSpec product={product} />

              <InfoCta product={product} loggedIn={loggedIn} />

              <div className="stat-strip" style={{ marginTop: 24 }}>
                <div>
                  <div className="lbl">Partner</div>
                  <div className="val">{product.partnerStatus || 'Direct partner'}</div>
                </div>
                <div>
                  <div className="lbl">Warranty</div>
                  <div className="val">{product.warranty || 'Manufacturer'}</div>
                </div>
                <div>
                  <div className="lbl">Service</div>
                  <div className="val">{product.service || 'In-region'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* Stacked details: Overview / Specifications / Downloads / BOM */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 48 }}>
          <div>
            <span className="eyebrow">Overview</span>
            <p className="body-lg" style={{ marginTop: 12 }}>
              {overviewText}
            </p>
          </div>

          <div>
            <span className="eyebrow">Specifications</span>
            <div style={{ marginTop: 12 }}>
              <FullSpec product={product} />
            </div>
          </div>

          <div>
            <span className="eyebrow">Downloads</span>
            <div style={{ marginTop: 12 }}>
              {product.datasheetUrl ? (
                <a className="btn btn--ghost btn--sm" href={product.datasheetUrl} target="_blank" rel="noopener">
                  Download spec sheet <span className="arrow">→</span>
                </a>
              ) : (
                <p className="text-muted">
                  Contact us for documentation —{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Documentation request — ${product.name}`)}`}
                    style={{ color: 'var(--crimson)', textDecoration: 'underline' }}
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              )}
            </div>
          </div>

          {/* BOM section — differs by product type */}
          {isEquipment ? (
            <div>
              <span className="eyebrow">Bill of materials</span>
              <h2 className="h-2" style={{ marginTop: 8 }}>
                Compatible spare parts &amp; consumables
              </h2>
              {product.compatibleSpares.length > 0 ? (
                <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                  {product.compatibleSpares.map((s) => (
                    <SpareItem key={s.slug} s={s} />
                  ))}
                </div>
              ) : (
                <p className="text-muted" style={{ marginTop: 16 }}>
                  No spare parts listed for this instrument yet.
                </p>
              )}
            </div>
          ) : product.usedInEquipment.length > 0 ? (
            <div>
              <span className="eyebrow">Compatibility</span>
              <h2 className="h-2" style={{ marginTop: 8 }}>
                Fits / used in
              </h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                {product.usedInEquipment.map((e) => {
                  const src = productImageUrl(e.image)
                  return (
                    <a
                      key={e.slug}
                      className="card"
                      href={`/products/${encodeURIComponent(e.slug)}`}
                      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 12 }}
                    >
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          flex: '0 0 auto',
                          border: '1px solid var(--rule-c)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                        }}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={e.name}
                            loading="lazy"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        ) : null}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="card__brand">{e.brand}</span>
                        <h3 className="card__title" style={{ fontSize: 16, margin: '2px 0 0' }}>
                          {e.name}
                        </h3>
                      </div>
                      <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
                      </svg>
                    </a>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {product.related.length > 0 ? (
        <>
          <hr className="rule" />
          <section className="section">
            <div className="container">
              <div className="section-head">
                <div className="section-head__title">
                  <span className="eyebrow">You may also need</span>
                  <h2 className="h-2">Related products.</h2>
                </div>
              </div>
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {product.related.map((p) => (
                  <RelatedCard key={p.slug} p={p} />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}
