import { getInstrumentCount } from '@/lib/counts'
import SectionCards from './SectionCards'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const instrumentCount = await getInstrumentCount()

  return (
    <main id="main">
        <section className="section">
          <div className="container">
            <p className="breadcrumb">
              <a href="/">[HOME]</a><span className="sep">/</span>PRODUCTS
            </p>

            <div className="coord">
              <span>003 / CATALOG</span>
              <span data-catalog-count>{instrumentCount} INSTRUMENTS</span>
              <span>16 BRANDS · 6 INDUSTRIES</span>
            </div>

            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Catalog</span>
                <h1 className="h-1">Every <em>instrument</em>, one search away.</h1>
              </div>
              <p className="section-head__sub">XRF, flash point, distillation, mercury, NMR, FTIR, viscosity, RoHS — filter by brand, industry and test type.</p>
            </div>

            {/* Catalog section entry points (DB-driven section pages) */}
            <SectionCards />
          </div>
        </section>

        <hr className="rule" />

        <section className="section">
          <div className="container">

            <div className="products-layout">

              <aside className="products-sidebar" data-products-sidebar>
                <div className="products-sidebar__group">
                  <h4>Search</h4>
                  <input type="search" placeholder="Name, brand, test, standard..." data-products-search aria-label="Search instruments" />
                </div>
                <div className="products-sidebar__group">
                  <h4>Industry</h4>
                  <div className="checkbox-list" data-filter="industries"></div>
                </div>
                <div className="products-sidebar__group">
                  <h4>Brand</h4>
                  <div className="checkbox-list" data-filter="brands"></div>
                </div>
                <div className="products-sidebar__group">
                  <h4>Test type</h4>
                  <div className="checkbox-list" data-filter="testTypes"></div>
                </div>
                <div className="products-sidebar__group products-sidebar__reset">
                  <button type="button" className="btn btn--ghost btn--sm" data-products-reset>Clear all filters</button>
                </div>
              </aside>

              <div>
                <div className="products-toolbar">
                  <span className="products-toolbar__count" data-products-count><strong>[—]</strong> instruments shown</span>
                  <label className="products-sort">
                    Sort
                    <select data-products-sort>
                      <option value="featured">Featured first</option>
                      <option value="brand">By brand A→Z</option>
                      <option value="name">By name A→Z</option>
                    </select>
                  </label>
                </div>
                <div className="products-page-grid" data-products-grid></div>
              </div>

            </div>
          </div>
        </section>

        <section className="section section--tight cta-band">
          <div className="container cta-band__inner" data-reveal>
            <span className="eyebrow">Need help shortlisting?</span>
            <h2 className="h-1">Tell us your <em>standard</em>.</h2>
            <p className="body-lg" style={{ textAlign: 'center' }}>Send us the ASTM, ISO or IP method you need to comply with. We&apos;ll come back with the right shortlist — usually within the working day.</p>
            <div className="actions">
              <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp +971 55 756 6123 <span className="arrow">→</span></a>
              <a className="btn btn--ghost" href="/contact">Use the contact form</a>
            </div>
          </div>
        </section>

    </main>
  )
}
