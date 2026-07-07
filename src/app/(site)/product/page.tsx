import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

// Server-rendered SEO metadata per product (the body still hydrates client-side
// from window.PRODUCTS, but Google now sees a real, product-specific title).
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ slug?: string }> }): Promise<Metadata> {
  const { slug } = await searchParams
  if (!slug) return { title: 'Product' }
  const p = await db.product.findUnique({ where: { slug }, select: { name: true, desc: true, brand: { select: { name: true } } } })
  if (!p) return { title: 'Product' }
  const title = `${p.brand.name} ${p.name} — Price & Quote in UAE, Qatar & Gulf`
  return {
    title,
    description: `${p.desc} Authorized ${p.brand.name} distributor across the UAE, Dubai, Qatar and the Gulf — request a price or quote from Chemparts.`,
    alternates: { canonical: `/product?slug=${slug}` },
    openGraph: { title, description: p.desc, url: `${SITE_URL}/product?slug=${slug}`, type: 'website' },
  }
}

// Ported from product.html. The original reads ?slug= from the query and
// product-detail.js hydrates this static markup client-side from window.PRODUCTS.
export default function ProductPage() {
  return (
    <main id="main">
        <section className="section">
          <div className="container">

            <p className="breadcrumb">
              <a href="/">[HOME]</a><span className="sep">/</span>
              <a href="/products">[PRODUCTS]</a><span className="sep">/</span>
              <span data-pdp-breadcrumb>—</span>
            </p>

            <div className="pdp-layout">

              <div className="pdp-gallery">
                <div className="pdp-gallery__main" data-pdp-main></div>
                <div className="pdp-gallery__thumbs" data-pdp-thumbs></div>
              </div>

              <div className="pdp-info" data-reveal>
                <span className="pdp-info__brand" data-pdp-brand>—</span>
                <h1 className="pdp-info__title" data-pdp-title>—</h1>
                <p className="pdp-info__desc" data-pdp-desc>—</p>
                <table className="spec-table" data-pdp-quick-spec></table>
                <div className="pdp-info__cta">
                  <button type="button" className="btn btn--accent" data-pdp-cart>Add to cart <span className="arrow">→</span></button>
                  <button type="button" className="btn btn--primary" data-pdp-quote data-quote="">Request a quote <span className="arrow">→</span></button>
                  <button type="button" className="btn btn--ghost" data-pdp-price data-price="">Request price <span className="arrow">→</span></button>
                  <a className="btn btn--ghost" href="mailto:info@chemparts-me.com" data-pdp-datasheet>Download spec sheet</a>
                </div>
                <div className="stat-strip" style={{ marginTop: 24 }}>
                  <div><div className="lbl">Authorized</div><div className="val">Direct partner</div></div>
                  <div><div className="lbl">Warranty</div><div className="val">Manufacturer</div></div>
                  <div><div className="lbl">Service</div><div className="val">In-region</div></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <hr className="rule" />

        <section className="section">
          <div className="container">
            <div className="tabs" role="tablist" aria-label="Product details">
              <button role="tab" id="tab-overview" aria-controls="panel-overview" aria-selected="true" tabIndex={0} className="tab"><span className="tab-num">01</span> Overview</button>
              <button role="tab" id="tab-specs" aria-controls="panel-specs" aria-selected="false" tabIndex={-1} className="tab"><span className="tab-num">02</span> Specifications</button>
              <button role="tab" id="tab-standards" aria-controls="panel-standards" aria-selected="false" tabIndex={-1} className="tab"><span className="tab-num">03</span> Standards</button>
              <button role="tab" id="tab-docs" aria-controls="panel-docs" aria-selected="false" tabIndex={-1} className="tab"><span className="tab-num">04</span> Documentation</button>
            </div>
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="tabpanel" data-pdp-overview></div>
            <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" className="tabpanel" hidden data-pdp-specs></div>
            <div role="tabpanel" id="panel-standards" aria-labelledby="tab-standards" className="tabpanel" hidden data-pdp-standards></div>
            <div role="tabpanel" id="panel-docs" aria-labelledby="tab-docs" className="tabpanel" hidden data-pdp-docs></div>
          </div>
        </section>

        <hr className="rule" />

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">You may also need</span>
                <h2 className="h-2">Related <em>instruments</em>.</h2>
              </div>
            </div>
            <div className="products-grid" data-pdp-related style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}></div>
          </div>
        </section>

    </main>
  )
}
