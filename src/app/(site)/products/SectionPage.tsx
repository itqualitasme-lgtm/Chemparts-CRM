import {
  type Section,
  SECTION_META,
  getSectionProducts,
  getSectionFacets,
  productImageUrl,
  type SectionProduct,
} from '@/lib/catalog-db'
import { priceState, canAddToCart } from '@/lib/price'
import { optimizedImg } from '@/lib/img'
import { getSessionUser } from '@/lib/auth/session'
import RequestPrice from './RequestPrice'
import AddToCart from './AddToCart'
import AddToQuote from './AddToQuote'

// Shared renderer for the three catalog section pages. Server component; the
// filters are link-based (searchParams), so no client JS is needed here.
// Styling reuses the ported marketing site's own CSS classes (from
// /assets/css/styles.css) — the (site) group is excluded from Tailwind.

type RawSearchParams = { q?: string; brand?: string; industry?: string; tag?: string; page?: string }

const PAGE_SIZE = 24

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

/**
 * A card is a link to the PDP. The price-state block lives OUTSIDE the anchor
 * (it can contain the interactive Request-price form), so the card is a plain
 * wrapper with the media/body link inside and the commerce block beneath.
 */
function ProductCard({ p, loggedIn, section }: { p: SectionProduct; loggedIn: boolean; section: Section }) {
  const src = productImageUrl(p.image)
  const thumb = src ? optimizedImg(src, 640) : null
  const state = priceState(p)
  const cartEligible = canAddToCart(p)

  return (
    <div className="card" data-industry={p.industries.join(',')} style={{ display: 'flex', flexDirection: 'column' }}>
      <a
        href={`/products/${encodeURIComponent(p.slug)}`}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, color: 'inherit', textDecoration: 'none' }}
      >
        <div className="card__media">
          {p.isNew ? <span className="pill pill--new">New</span> : p.featured ? <span className="pill pill--crimson">Featured</span> : null}
          {src ? <img src={thumb ?? src} alt={p.name} loading="lazy" decoding="async" /> : null}
          {p.brandLogo ? (
            <span className="card__brandlogo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* brandLogo is already an optimized /_next/image URL (see catalog-db). */}
              <img src={p.brandLogo} alt={p.brand} loading="lazy" />
            </span>
          ) : null}
        </div>
        <div className="card__body" style={{ paddingBottom: 8 }}>
          <span className="card__brand">{p.brand}</span>
          <h3 className="card__title">{p.name}</h3>
          <p className="card__desc">{p.desc}</p>
        </div>
      </a>

      <div className="card__body" style={{ paddingTop: 0 }}>
        {state.mode === 'listed' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>
              {formatPrice(state.currency, state.price!)}
            </span>
            {cartEligible ? (
              <AddToCart productId={p.id} variant="compact" />
            ) : (
              <div className="card__foot" style={{ marginTop: 0 }}>
                <span className="mono text-muted">Request this item</span>
                <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </div>
            )}
          </div>
        ) : state.mode === 'indicative' ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>
              {formatPrice(state.currency, state.price!)}
            </span>
            <span className="mono text-muted" style={{ fontSize: 11 }}>
              Indicative — confirm current price
            </span>
            <AddToQuote productId={p.id} variant="compact" />
            <RequestPrice productId={p.id} loggedIn={loggedIn} variant="secondary" label="Request current price" />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="mono text-muted" style={{ fontSize: 13 }}>
              Price on request
            </span>
            <AddToQuote productId={p.id} variant="compact" />
            <RequestPrice productId={p.id} loggedIn={loggedIn} variant="secondary" label="Request current price" />
          </div>
        )}
      </div>
    </div>
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
    tag: sp.tag || undefined,
  }

  const [products, facets, user] = await Promise.all([
    getSectionProducts(section, filters),
    getSectionFacets(section),
    getSessionUser(),
  ])
  const loggedIn = user != null

  const meta = SECTION_META[section]
  const hasFilters = Boolean(filters.q || filters.brand || filters.industry || filters.tag)

  // Pagination over the filtered result set.
  const total = products.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(totalPages, Math.max(1, Number(sp.page ?? '1') || 1))
  const pageProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const pageHref = (p: number) =>
    buildHref(section, {
      q: filters.q,
      brand: filters.brand,
      industry: filters.industry,
      tag: filters.tag,
      page: p > 1 ? String(p) : undefined,
    })

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
          <div className="products-layout catalog-layout">
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
                  <strong>[{String(total).padStart(2, '0')}]</strong> {meta.countLabel}
                  {total > PAGE_SIZE ? <span className="text-muted"> · showing {from}–{to}</span> : ' shown'}
                </span>
                {filters.tag ? (
                  <span className="tag-chip tag-chip--active">
                    #{filters.tag}
                    <a
                      href={buildHref(section, { q: filters.q, brand: filters.brand, industry: filters.industry })}
                      aria-label="Clear tag"
                      style={{ marginLeft: 6 }}
                    >
                      ✕
                    </a>
                  </span>
                ) : null}
              </div>

              {total > 0 ? (
                <div className="products-page-grid catalog-grid">
                  {pageProducts.map((p) => (
                    <ProductCard key={p.slug} p={p} loggedIn={loggedIn} section={section} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">No matches</span>
                  <h3>No {meta.countLabel} match the current filters.</h3>
                  <p>
                    Try removing a filter, or{' '}
                    <a href="/contact#form" style={{ color: 'var(--crimson)', textDecoration: 'underline' }}>
                      contact our team
                    </a>{' '}
                    — we can source items outside this catalog too.
                  </p>
                  <a className="btn btn--primary btn--sm" href={`/products/${section}`}>
                    Clear all filters
                  </a>
                </div>
              )}

              {totalPages > 1 ? (
                <nav className="catalog-pagination" aria-label="Pagination">
                  {page > 1 ? (
                    <a className="btn btn--ghost btn--sm" href={pageHref(page - 1)}>← Prev</a>
                  ) : (
                    <span className="btn btn--ghost btn--sm" aria-disabled="true" style={{ opacity: 0.4, pointerEvents: 'none' }}>← Prev</span>
                  )}
                  <span className="mono catalog-pagination__status">Page {page} of {totalPages}</span>
                  {page < totalPages ? (
                    <a className="btn btn--ghost btn--sm" href={pageHref(page + 1)}>Next →</a>
                  ) : (
                    <span className="btn btn--ghost btn--sm" aria-disabled="true" style={{ opacity: 0.4, pointerEvents: 'none' }}>Next →</span>
                  )}
                </nav>
              ) : null}
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
              WhatsApp +971 55 756 6123
            </a>
            <a className="btn btn--ghost" href="/contact#form">
              Use the contact form
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
