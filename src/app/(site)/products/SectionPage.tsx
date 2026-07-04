import {
  type Section,
  SECTION_META,
  getSectionProducts,
  getSectionFacets,
  ctaFor,
  productImageUrl,
  type SectionProduct,
} from '@/lib/catalog-db'

// Shared renderer for the three catalog section pages. Server component; the
// filters are link-based (searchParams), so no client JS is needed here.
// Styling reuses the ported marketing site's own CSS classes (from
// /assets/css/styles.css) — the (site) group is excluded from Tailwind.

type RawSearchParams = { q?: string; brand?: string; industry?: string }

function buildHref(section: Section, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  const qs = sp.toString()
  return `/products/${section}${qs ? `?${qs}` : ''}`
}

function formatPrice(currency: string, value: number): string {
  const n = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `${currency} ${n}`
}

/** Type/price-aware primary action label + optional price line for a card. */
function cardCommerce(p: SectionProduct): {
  price: string | null
  label: string
  cartNote: boolean
} {
  const cta = ctaFor(p)
  if (cta === 'CART') {
    return {
      price: p.listPrice != null ? formatPrice(p.currency, p.listPrice) : null,
      label: 'Request this item',
      cartNote: true,
    }
  }
  // QUOTE-side labels: unpriced spares get "Request price"; everything else a quote.
  if (p.type === 'SPARE_PART' && p.listPrice == null) {
    return { price: null, label: 'Request price', cartNote: false }
  }
  return { price: null, label: 'Request a quote', cartNote: false }
}

function ProductCard({ p }: { p: SectionProduct }) {
  const src = productImageUrl(p.image)
  const { price, label, cartNote } = cardCommerce(p)
  return (
    <a className="card" href={`/product?slug=${encodeURIComponent(p.slug)}`} data-industry={p.industries.join(',')}>
      <div className="card__media">
        {p.featured ? <span className="pill pill--crimson">Featured</span> : null}
        {src ? <img src={src} alt={p.name} loading="lazy" decoding="async" /> : null}
      </div>
      <div className="card__body">
        <span className="card__brand">{p.brand}</span>
        <h3 className="card__title">{p.name}</h3>
        <p className="card__desc">{p.desc}</p>
        {price ? (
          <div>
            <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>{price}</span>
            {cartNote ? (
              <span className="mono text-muted" style={{ display: 'block', fontSize: 11, marginTop: 4 }}>
                Online ordering coming soon
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="card__foot">
          <span className="mono text-muted">{label}</span>
          <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </div>
      </div>
    </a>
  )
}

export default async function SectionPage({
  section,
  searchParams,
}: {
  section: Section
  searchParams: Promise<RawSearchParams>
}) {
  const sp = await searchParams
  const filters = {
    q: sp.q?.trim() || undefined,
    brand: sp.brand || undefined,
    industry: sp.industry || undefined,
  }

  const [products, facets] = await Promise.all([
    getSectionProducts(section, filters),
    getSectionFacets(section),
  ])

  const meta = SECTION_META[section]
  const hasFilters = Boolean(filters.q || filters.brand || filters.industry)

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/">[HOME]</a>
            <span className="sep">/</span>
            <a href="/products">[PRODUCTS]</a>
            <span className="sep">/</span>
            {meta.eyebrow.toUpperCase()}
          </p>

          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">{meta.eyebrow}</span>
              <h1 className="h-1">{meta.title}</h1>
            </div>
            <p className="section-head__sub">{meta.intro}</p>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container">
          <div className="products-layout">
            <aside className="products-sidebar">
              <form className="products-sidebar__group" method="get" action={`/products/${section}`}>
                <h4>Search</h4>
                {/* Preserve active brand/industry when searching */}
                {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
                {filters.industry ? <input type="hidden" name="industry" value={filters.industry} /> : null}
                <input
                  type="search"
                  name="q"
                  defaultValue={filters.q ?? ''}
                  placeholder="Name, brand, standard..."
                  aria-label={`Search ${meta.countLabel}`}
                />
              </form>

              {facets.brands.length > 0 ? (
                <div className="products-sidebar__group">
                  <h4>Brand</h4>
                  <div className="checkbox-list">
                    {facets.brands.map((b) => {
                      const active = filters.brand === b.value
                      return (
                        <a
                          key={b.value}
                          href={buildHref(section, {
                            q: filters.q,
                            industry: filters.industry,
                            brand: active ? undefined : b.value,
                          })}
                          aria-current={active ? 'true' : undefined}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                            color: active ? 'var(--navy)' : undefined,
                            fontWeight: active ? 600 : undefined,
                          }}
                        >
                          <span>{b.label}</span>
                          <span className="count">[{String(b.count).padStart(2, '0')}]</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {facets.industries.length > 0 ? (
                <div className="products-sidebar__group">
                  <h4>Industry</h4>
                  <div className="checkbox-list">
                    {facets.industries.map((i) => {
                      const active = filters.industry === i.value
                      return (
                        <a
                          key={i.value}
                          href={buildHref(section, {
                            q: filters.q,
                            brand: filters.brand,
                            industry: active ? undefined : i.value,
                          })}
                          aria-current={active ? 'true' : undefined}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                            color: active ? 'var(--navy)' : undefined,
                            fontWeight: active ? 600 : undefined,
                          }}
                        >
                          <span>{i.label}</span>
                          <span className="count">[{String(i.count).padStart(2, '0')}]</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {hasFilters ? (
                <div className="products-sidebar__group products-sidebar__reset">
                  <a className="btn btn--ghost btn--sm" href={`/products/${section}`}>
                    Clear all filters
                  </a>
                </div>
              ) : null}
            </aside>

            <div>
              <div className="products-toolbar">
                <span className="products-toolbar__count">
                  <strong>[{String(products.length).padStart(2, '0')}]</strong> {meta.countLabel} shown
                </span>
              </div>

              {products.length > 0 ? (
                <div className="products-page-grid">
                  {products.map((p) => (
                    <ProductCard key={p.slug} p={p} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">No matches</span>
                  <h3>No {meta.countLabel} match the current filters.</h3>
                  <p>
                    Try removing a filter, or{' '}
                    <a href="/contact" style={{ color: 'var(--crimson)', textDecoration: 'underline' }}>
                      contact our team
                    </a>{' '}
                    — we can source items outside this catalog too.
                  </p>
                  <a className="btn btn--primary btn--sm" href={`/products/${section}`}>
                    Clear all filters
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight cta-band">
        <div className="container cta-band__inner" data-reveal>
          <span className="eyebrow">Need help shortlisting?</span>
          <h2 className="h-1">
            Tell us your <em>requirement</em>.
          </h2>
          <p className="body-lg" style={{ textAlign: 'center' }}>
            Send us the method, model or part you need. We&apos;ll come back with the right shortlist — usually within
            the working day.
          </p>
          <div className="actions">
            <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">
              WhatsApp +971 55 756 6123 <span className="arrow">→</span>
            </a>
            <a className="btn btn--ghost" href="/contact">
              Use the contact form
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
