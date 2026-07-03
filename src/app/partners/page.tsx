import Script from 'next/script'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import SiteChrome from '@/components/site/SiteChrome'

export const dynamic = 'force-dynamic'

export default function PartnersPage() {
  return (
    <>
      <SiteHeader activeNav="partners" />

      <main id="main">
        <section className="section">
          <div className="container">
            <div className="coord">
              <span>006 / PARTNERS</span>
              <span data-brand-total>— BRANDS</span>
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
                <h2 className="h-2">All 16 <em>brand partners</em>.</h2>
              </div>
              <p className="section-head__sub">Hover for the year we became authorized regional distributor. Click any brand for catalog.</p>
            </div>
            <div className="partners-wall" data-reveal data-stagger data-partners-wall></div>
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

            <div className="brand-cards" data-brand-cards data-reveal></div>
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

      <SiteFooter />

      <SiteChrome />

      {/* Build dynamic brand cards from catalog */}
      <Script id="partners-brand-cards" strategy="afterInteractive">{`
    (function () {
      if (!window.PRODUCTS || !window.BRANDS) return;
      const host = document.querySelector('[data-brand-cards]');
      if (!host) return;

      const META = {
        "Hitachi":            { logo: "hitachi.jpg",          country: "Japan",       focus: "XRF, EDX, elemental analysis" },
        "Tanaka":             { logo: "tanaka.jpg",           country: "Japan",       focus: "Petroleum testing — flash point, distillation, pour point" },
        "Oxford Instruments": { logo: "oxford.jpg",           country: "UK",          focus: "Benchtop NMR, mercury analyzers, XRF" },
        "Tamson":             { logo: "pt-tamson-logo.jpg",   country: "Netherlands", focus: "Temperature baths and viscosity instruments" },
        "Nabertherm":         { logo: "nabertherm.webp",      country: "Germany",     focus: "Industrial furnaces and ashing ovens" },
        "Normalab":           { logo: "normalab.svg",         country: "France",      focus: "Petroleum and lubricant testing apparatus" },
        "Biolab":             { logo: "biolab.png",           country: "USA",         focus: "Mercury and chlorine analyzers" },
        "Linetronics":        { logo: "linetronics.jpg",      country: "Germany",     focus: "Process and laboratory electronics" },
        "PG Instruments":     { logo: "pg-instruments.webp",  country: "UK",          focus: "UV-Vis spectroscopy and AAS" },
        "Peak Instruments":   { logo: "peak-instrument.jpg",  country: "USA",         focus: "Gas generators for chromatography labs" },
        "Chromos":            { logo: "chromos.jpg",          country: "Russia",      focus: "Gas chromatography systems" },
        "Mitsubishi":         { logo: null,                   country: "Japan",       focus: "Moisture analyzers, halogen and TOX" },
        "Lumex":              { logo: null,                   country: "Russia",      focus: "Mercury and elemental analyzers" },
        "Pruler":             { logo: null,                   country: "Germany",     focus: "Specialty laboratory instruments" },
        "Scavini":            { logo: null,                   country: "Italy",       focus: "Bench-top petroleum testing" },
        "Chemparts":          { logo: null,                   country: "UAE",         focus: "Chemparts in-house instruments and accessories" }
      };

      function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      const ANCHOR = ["Hitachi", "Tanaka", "Oxford Instruments"];
      const sorted = [
        ...ANCHOR.filter(b => window.BRANDS.includes(b)),
        ...window.BRANDS.filter(b => !ANCHOR.includes(b)).sort()
      ];

      const wall = document.querySelector('[data-partners-wall]');
      if (wall) {
        const SINCE = { "Hitachi":"SINCE 2008", "Tanaka":"SINCE 2010", "Oxford Instruments":"SINCE 2012", "Tamson":"SINCE 2013", "Nabertherm":"SINCE 2014", "Normalab":"SINCE 2014", "Biolab":"SINCE 2015", "Linetronics":"SINCE 2016", "PG Instruments":"SINCE 2016", "Peak Instruments":"SINCE 2017", "Chromos":"SINCE 2018", "Mitsubishi":"SINCE 2018", "Lumex":"SINCE 2019", "Pruler":"SINCE 2020", "Scavini":"SINCE 2021", "Chemparts":"IN-HOUSE" };
        wall.innerHTML = sorted.map(b => {
          const filterHash = encodeURIComponent(JSON.stringify({ b: [b] }));
          return '<a class="partners-wall__cell" href="/products#' + filterHash + '" data-since="' + (SINCE[b] || '') + '">' + escapeHtml(b) + '</a>';
        }).join('');
      }

      host.innerHTML = sorted.map(b => {
        const m = META[b] || {};
        const count = window.PRODUCTS.filter(p => p.brand === b).length;
        const filterHash = encodeURIComponent(JSON.stringify({ b: [b] }));
        const logoHtml = m.logo
          ? '<img src="/assets/images/partners/' + m.logo + '" alt="' + escapeHtml(b) + ' logo" loading="lazy">'
          : '<span class="brand-card__wordmark">' + escapeHtml(b) + '</span>';
        return (
          '<a class="brand-card" href="/products#' + filterHash + '">' +
            '<div class="brand-card__logo">' + logoHtml + '</div>' +
            '<div class="brand-card__body">' +
              '<div class="brand-card__head">' +
                '<h3>' + escapeHtml(b) + '</h3>' +
                '<span class="brand-card__country mono">' + escapeHtml(m.country || '') + '</span>' +
              '</div>' +
              '<p class="brand-card__focus">' + escapeHtml(m.focus || 'Specialist analytical and laboratory instrumentation.') + '</p>' +
              '<div class="brand-card__foot">' +
                '<span class="mono"><strong>[' + String(count).padStart(2,'0') + ']</strong> instruments in catalog</span>' +
                '<svg class="brand-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.25"/></svg>' +
              '</div>' +
            '</div>' +
          '</a>'
        );
      }).join('');

      const total = document.querySelector('[data-brand-total]');
      if (total) total.textContent = window.BRANDS.length + ' BRANDS';
    })();
  `}</Script>
    </>
  )
}
