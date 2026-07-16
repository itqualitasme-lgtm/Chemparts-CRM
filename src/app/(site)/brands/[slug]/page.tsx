import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { brandLogoUrl } from '@/lib/brand-image'
import { optimizedImg } from '@/lib/img'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getBrand(slug: string) {
  return db.brand.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, logo: true, countryOfOrigin: true, focus: true, description: true,
      products: {
        where: { active: true },
        orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        select: { slug: true, name: true, image: true, desc: true, type: true },
      },
    },
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return { title: 'Brand not found' }
  const title = `${brand.name} in UAE, Dubai, Qatar & the Gulf — Authorized Distributor`
  const description = `Chemparts is the authorized regional distributor of ${brand.name} ${brand.focus ? `(${brand.focus}) ` : ''}across the UAE, Dubai, Abu Dhabi, Sharjah, Qatar and the wider Gulf. ${brand.products.length} ${brand.name} products in the catalog — sales, installation, calibration and genuine spares with full warranty.`
  return {
    title,
    description,
    keywords: [`${brand.name} UAE`, `${brand.name} Dubai`, `${brand.name} Qatar`, `${brand.name} Gulf`, `${brand.name} distributor`, `${brand.name} price`, `${brand.name} dealer Middle East`],
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/brands/${brand.slug}`, type: 'website' },
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const logo = brandLogoUrl(brand.logo)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Partners', item: `${SITE_URL}/partners` },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `${SITE_URL}/brands/${brand.slug}` },
    ],
  }

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/">[HOME]</a><span className="sep">/</span>
            <a href="/partners">[PARTNERS]</a><span className="sep">/</span>{brand.name.toUpperCase()}
          </p>

          <div className="about-hero about-hero--wide" data-reveal>
            <div className="about-hero__copy">
              <span className="eyebrow">Authorized distributor · {brand.countryOfOrigin || 'Global'}</span>
              <h1 className="h-display">{brand.name} in the <em>UAE &amp; Gulf</em>.</h1>
              <p className="body-lg">
                Chemparts Middle East is the authorized regional distributor of <strong>{brand.name}</strong>
                {brand.focus ? <> — {brand.focus.toLowerCase()}</> : null}. We supply, install, calibrate and service {brand.name}
                {' '}equipment across the <strong>UAE (Dubai, Abu Dhabi, Sharjah)</strong>, <strong>Qatar</strong> and the wider Gulf,
                with genuine spares and full manufacturer warranty.
              </p>
              {brand.description ? <p className="body-lg" style={{ marginTop: 12 }}>{brand.description}</p> : null}
              <div className="hero__cta" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn--accent" data-quote="">Request a {brand.name} quote</button>
                <a className="btn btn--ghost" href="/contact">Talk to an expert</a>
              </div>
            </div>
            {logo ? (
              <figure className="about-hero__photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 32 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={`${brand.name} logo`} style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }} />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">{brand.name} catalog</span>
              <h2 className="h-1">{brand.products.length} {brand.name} <em>products</em> in stock.</h2>
            </div>
            <p className="section-head__sub">Instruments, spares and consumables from {brand.name}, held in the region. Pricing and lead-time on request.</p>
          </div>

          {brand.products.length === 0 ? (
            <p className="body-lg" style={{ marginTop: 24 }}>Contact us for the current {brand.name} range — <a href="/contact" style={{ color: 'var(--crimson)' }}>request a catalog</a>.</p>
          ) : (
            <div className="products-page-grid" style={{ marginTop: 24 }}>
              {brand.products.map((p) => {
                const thumb = optimizedImg(p.image, 640)
                return (
                  <a key={p.slug} className="card" href={`/products/${encodeURIComponent(p.slug)}`}>
                    {thumb ? (
                      <div className="card__media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={`${brand.name} ${p.name}`} loading="lazy" decoding="async" />
                      </div>
                    ) : null}
                    <div className="card__body">
                      <span className="card__brand">{brand.name}</span>
                      <h3 className="card__title">{p.name}</h3>
                      <p className="card__desc">{p.desc}</p>
                      <div className="card__foot">
                        <span className="mono text-muted">View product</span>
                        <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
