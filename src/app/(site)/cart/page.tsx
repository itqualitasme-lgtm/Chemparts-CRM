import type { Metadata } from 'next'
import { getCart } from '@/lib/cart'
import { getSessionUser } from '@/lib/auth/session'
import CartLineControls from './CartLineControls'
import EnquiryForm from './EnquiryForm'

// Cart page. Server component; the qty/remove controls and the enquiry form are
// client islands. Styling reuses the ported marketing site's own CSS classes —
// the (site) group is excluded from Tailwind, so NO Tailwind utilities here.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Your cart - Chemparts Middle East' }

function formatPrice(currency: string, value: number): string {
  const n = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${currency} ${n}`
}

export default async function CartPage() {
  const [cart, user] = await Promise.all([getCart(), getSessionUser()])
  const loggedIn = user != null

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/">[HOME]</a>
            <span className="sep">/</span>
            <a href="/products">[PRODUCTS]</a>
            <span className="sep">/</span>
            CART
          </p>

          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Cart</span>
              <h1 className="h-1">Your cart</h1>
            </div>
            <p className="section-head__sub">
              Add items and submit them as an enquiry. Our team confirms pricing and availability
              with a formal quotation.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container">
          {cart.lines.length === 0 ? (
            <div className="empty-state">
              <span className="eyebrow">Empty cart</span>
              <h3>Your cart is empty.</h3>
              <p>Browse the catalog and add listed items, or request a price on anything quote-only.</p>
              <a className="btn btn--primary btn--sm" href="/products">
                Browse products
              </a>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 40,
                gridTemplateColumns: 'minmax(0, 1fr)',
                alignItems: 'start',
              }}
            >
              {/* Line items */}
              <div style={{ display: 'grid', gap: 0 }}>
                {cart.lines.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      padding: '20px 0',
                      borderBottom: '1px solid var(--rule-c)',
                    }}
                  >
                    <div
                      style={{
                        width: 84,
                        height: 84,
                        flex: '0 0 auto',
                        border: '1px solid var(--rule-c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white',
                      }}
                    >
                      {l.image ? (
                        <img
                          src={l.image}
                          alt={l.name}
                          loading="lazy"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : null}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 8 }}>
                      <div>
                        <span className="card__brand">{l.brand}</span>
                        <h3 className="card__title" style={{ fontSize: 16, margin: '2px 0 0' }}>
                          <a
                            href={`/products/${encodeURIComponent(l.slug)}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {l.name}
                          </a>
                        </h3>
                      </div>
                      <span className="mono text-muted" style={{ fontSize: 13 }}>
                        {l.unitPrice != null ? `${formatPrice(l.currency, l.unitPrice)} each` : 'Price on request'}
                      </span>
                      <CartLineControls itemId={l.id} qty={l.qty} />
                    </div>

                    <div style={{ textAlign: 'right', minWidth: 90 }}>
                      <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>
                        {l.lineTotal != null ? formatPrice(l.currency, l.lineTotal) : '—'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Subtotal */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '20px 0 0',
                    gap: 16,
                  }}
                >
                  <span className="mono text-muted" style={{ fontSize: 13 }}>
                    Subtotal (priced items)
                  </span>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--navy)' }}>
                    {formatPrice(cart.currency, cart.subtotal)}
                  </span>
                </div>
                <p className="mono text-muted" style={{ fontSize: 11, margin: '6px 0 0' }}>
                  Excludes VAT, shipping and any price-on-request lines. Final pricing is confirmed on your enquiry.
                </p>
              </div>

              {/* Enquiry form */}
              <EnquiryForm loggedIn={loggedIn} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
