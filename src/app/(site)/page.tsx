import { getCatalogCounts } from '@/lib/counts'
import BrandMarquee from '@/components/site/BrandMarquee'
import ClientMarquee from '@/components/site/ClientMarquee'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { instruments: instrumentCount, brands: brandCount } = await getCatalogCounts()
  // Hero names 3 flagship catalogue partners (Hitachi, Tanaka, Oxford); the rest
  // of the live brands are "N more".
  const moreBrands = Math.max(0, brandCount - 3)

  return (
    <main id="main">

        {/* OPENING HERO BANNER */}
        <section className="hero-banner banner-section" aria-label="Chemparts at work across the UAE and Qatar">
          <img className="banner-section__bg" src="/assets/images/photos/uae-industrial.jpg" alt="" fetchPriority="high" decoding="async" />
          <div className="hero-banner__decor" aria-hidden="true">
            <span className="hero-banner__line hero-banner__line--1"></span>
            <span className="hero-banner__line hero-banner__line--2"></span>
            <span className="hero-banner__line hero-banner__line--3"></span>
          </div>
          <div className="banner-section__inner container">
            <span className="eyebrow hero-banner__eyebrow"><span className="hero-banner__pulse"></span>GCC · Since 2003</span>
            <h1 className="h-1 hero-banner__title" data-words-reveal>
              <span className="word">Trusted</span>
              <span className="word">by</span>
              <span className="word">the</span>
              <span className="word">GCC&apos;s</span>
              <span className="word"><em>refineries</em>,</span>
              <span className="word">terminals</span>
              <span className="word">and</span>
              <span className="word">labs.</span>
            </h1>
            <p className="body-lg hero-banner__lede">Authorized partner for <strong>Hitachi · Tanaka · Oxford · KEM</strong> and {moreBrands} more specialist brands. <strong>{instrumentCount} analytical instruments</strong> in stock — XRF, flash point, distillation, NMR, FTIR — plus OEM spares, consumables and turnkey lab fit-outs. <strong>Same-day quotes. Working-day response.</strong></p>
            <div className="hero-banner__cta hero-banner__fade-in">
              <a className="btn btn--accent btn--lg" href="/products">Browse {instrumentCount} instruments <span className="arrow">→</span></a>
              <a className="btn btn--inverse btn--lg" href="/contact">Talk to an expert</a>
            </div>
            <div className="banner-section__stats hero-banner__fade-in">
              <div><span className="num num-display">500+</span><span className="lbl">Active clients</span></div>
              <div><span className="num num-display" data-target={instrumentCount}>{instrumentCount}+</span><span className="lbl">Instruments shipped/yr</span></div>
              <div><span className="num num-display">20+</span><span className="lbl">Years operating</span></div>
            </div>
          </div>
        </section>

        {/* HERO */}
        <section className="hero">
          <div className="blueprint-bg" aria-hidden="true"></div>

          {/* Floating molecules / atoms (decorative) */}
          <div className="hero-molecules" aria-hidden="true">
            <svg className="hero-molecule hero-molecule--1" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.4" />
              <circle cx="14" cy="40" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="66" cy="40" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="40" cy="14" r="3" fill="currentColor" opacity="0.6" />
              <line x1="14" y1="40" x2="66" y2="40" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
              <line x1="40" y1="14" x2="40" y2="66" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
            </svg>
            <svg className="hero-molecule hero-molecule--2" viewBox="0 0 80 80" fill="none">
              <polygon points="40,8 72,28 72,60 40,72 8,60 8,28" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.45" />
              <circle cx="40" cy="8" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="72" cy="28" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="72" cy="60" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="40" cy="72" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="8" cy="60" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="8" cy="28" r="2.5" fill="currentColor" opacity="0.5" />
            </svg>
            <svg className="hero-molecule hero-molecule--3" viewBox="0 0 80 80" fill="none">
              <circle cx="20" cy="40" r="8" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              <circle cx="60" cy="40" r="8" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              <circle cx="40" cy="20" r="6" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
              <line x1="28" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <line x1="36" y1="32" x2="24" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <line x1="44" y1="32" x2="56" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            </svg>
          </div>

          {/* Animated instrument-trace backdrop (decorative) */}
          <svg className="hero-scope" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="scope-fade" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#0A2540" stopOpacity="0" />
                <stop offset="0.15" stopColor="#0A2540" stopOpacity="1" />
                <stop offset="0.85" stopColor="#0A2540" stopOpacity="1" />
                <stop offset="1" stopColor="#0A2540" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="scope-fade-2" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#C8102E" stopOpacity="0" />
                <stop offset="0.4" stopColor="#C8102E" stopOpacity="0.55" />
                <stop offset="0.6" stopColor="#C8102E" stopOpacity="0.55" />
                <stop offset="1" stopColor="#C8102E" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* baseline grid */}
            <g className="hero-scope__grid" stroke="#0A2540" strokeOpacity="0.08" strokeWidth="0.6">
              <line x1="0" y1="80" x2="1440" y2="80" />
              <line x1="0" y1="160" x2="1440" y2="160" />
              <line x1="0" y1="240" x2="1440" y2="240" />
            </g>
            {/* primary trace (chromatogram-like) */}
            <path className="hero-scope__trace hero-scope__trace--a"
              d="M0 240 L60 240 L100 230 L130 235 L160 215 L190 240 L220 240 L240 120 L255 230 L280 240 L320 240 L340 195 L360 245 L400 245 L430 80 L455 240 L490 240 L520 235 L555 175 L585 240 L620 240 L660 240 L690 215 L720 240 L760 130 L780 245 L820 240 L860 240 L890 200 L920 240 L960 240 L990 165 L1015 240 L1050 240 L1090 240 L1120 60 L1150 240 L1190 240 L1220 230 L1255 195 L1285 240 L1320 240 L1360 240 L1400 220 L1440 240"
              stroke="url(#scope-fade)" fill="none" strokeWidth="1.2" strokeLinejoin="round" />
            {/* secondary trace (sine wave) */}
            <path className="hero-scope__trace hero-scope__trace--b"
              d="M0 170 Q40 130 80 170 T160 170 T240 170 T320 170 T400 170 T480 170 T560 170 T640 170 T720 170 T800 170 T880 170 T960 170 T1040 170 T1120 170 T1200 170 T1280 170 T1360 170 T1440 170"
              stroke="url(#scope-fade-2)" fill="none" strokeWidth="1" opacity="0.5" />
            {/* markers */}
            <g className="hero-scope__pts" fill="#C8102E">
              <circle cx="240" cy="120" r="2.5" />
              <circle cx="430" cy="80" r="2.5" />
              <circle cx="760" cy="130" r="2.5" />
              <circle cx="1120" cy="60" r="2.5" />
            </g>
          </svg>
          <span className="hero-scan" aria-hidden="true"></span>

          <div className="container">

            <div className="coord">
              <span>001 / HOMEPAGE</span>
              <span>LAT 25.348°N</span>
              <span>LONG 55.420°E</span>
              <span>UAE · QATAR · GULF</span>
            </div>

            <div className="hero__inner">
              <div className="hero__copy">
                <span className="eyebrow hero__eyebrow"><span className="hero__eyebrow-dot"></span>20+ YEARS · EST. 2003 · SHARJAH SAIF ZONE</span>
                <h1 className="h-display hero__title" data-words-reveal>
                  <span className="word">Precision</span>
                  <span className="word"><em>instruments</em></span>
                  <span className="word">for</span>
                  <span className="word">science</span>
                  <span className="word">&amp;</span>
                  <span className="word">industry.</span>
                </h1>
                <p className="body-lg hero__lede">Analytical instruments, OEM <strong>spare parts</strong>, lab consumables and <strong>turnkey lab solutions</strong> for petroleum, chemical, materials and environmental testing across the Middle East.</p>
                <div className="hero__cta">
                  <a className="btn btn--primary btn--lg" href="/products">Browse instruments <span className="arrow">→</span></a>
                  <a className="btn btn--ghost btn--lg" href="/contact">Talk to an expert</a>
                </div>
                <div className="hero__trust">
                  <span className="hero__trust-label mono">— Authorized partner</span>
                  <div className="hero__trust-logos">
                    <img width="140" height="36" src="/assets/images/partners/hitachi.jpg" alt="Hitachi" loading="eager" />
                    <img width="140" height="36" src="/assets/images/partners/tanaka.jpg" alt="Tanaka" loading="eager" />
                    <img width="140" height="36" src="/assets/images/partners/oxford.jpg" alt="Oxford Instruments" loading="eager" />
                    <img width="140" height="36" src="/assets/images/partners/kem-logo.jpg" alt="KEM" loading="eager" />
                    <img width="140" height="36" src="/assets/images/partners/normalab.svg" alt="Normalab" loading="eager" />
                    <span className="hero__trust-more mono">+11 more</span>
                  </div>
                </div>
              </div>

              <aside className="hero__feature" data-reveal data-hero-rotator data-hero-tilt style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
                <div className="hero__feature-glow" aria-hidden="true"></div>
                <a className="hero__feature-img" data-hero-link href="/product?slug=lab-x5000" aria-label="View featured instrument">
                  <img data-hero-img src="/assets/images/products/LAB-X5000.png" alt="Hitachi LAB-X5000 benchtop XRF analyzer" fetchPriority="high" />
                </a>
                <div className="hero__feature-meta">
                  <strong data-hero-name>LAB-X5000</strong>
                  <span className="pill pill--crimson">Featured</span>
                </div>
                <table className="spec-table">
                  <tbody data-hero-specs>
                    <tr><th>Make</th><td>Hitachi</td></tr>
                    <tr><th>Type</th><td>Benchtop XRF Analyzer</td></tr>
                    <tr><th>Standards</th><td>ASTM, ISO</td></tr>
                  </tbody>
                </table>
                <div className="hero__feature-progress" data-hero-progress aria-hidden="true"></div>
              </aside>
            </div>

            {/* stats */}
            <div className="hero__stats" data-reveal data-stagger>
              <div className="hero__stat"><span className="num num-display">20+</span><span className="lbl">Years operating</span></div>
              <div className="hero__stat"><span className="num num-display">16+</span><span className="lbl">Brand partners</span></div>
              <div className="hero__stat"><span className="num num-display">500+</span><span className="lbl">Active clients</span></div>
              <div className="hero__stat"><span className="num num-display">3</span><span className="lbl">UAE &amp; Qatar offices</span></div>
            </div>

            {/* Live activity ticker */}
            <div className="hero-ticker" aria-hidden="true">
              <div className="hero-ticker__track">
                <span><strong>● LIVE</strong></span>
                <span>QUOTE · LAB-X5000 dispatched · ADNOC procurement</span>
                <span className="hero-ticker__sep">/</span>
                <span>STOCK · APM-100 flash point · 4 units in Sharjah</span>
                <span className="hero-ticker__sep">/</span>
                <span>SERVICE · Annual calibration · ENOC refinery</span>
                <span className="hero-ticker__sep">/</span>
                <span>STANDARD · ASTM D86 distillation · application note ready</span>
                <span className="hero-ticker__sep">/</span>
                <span>DELIVERY · X-Pulse NMR commissioned · Qatar University</span>
                <span className="hero-ticker__sep">/</span>
                <span>QUOTE · X-Supreme 8000 · Bapco refinery lab</span>
                <span className="hero-ticker__sep">/</span>
                <span>SERVICE · IQ/OQ/PQ documentation · Ruwais</span>
                <span className="hero-ticker__sep">/</span>
                <span>STOCK · Mercury analyzer · in-region</span>
                <span className="hero-ticker__sep">/</span>
              </div>
            </div>

          </div>

          <div className="kinetic" aria-hidden="true">ANALYZE · CHEMPARTS · MEASURE</div>
        </section>

        {/* IMPRESSIONS */}
        <section className="section impressions-section" data-num="01 / 09 · Twenty years on the ground">
          <div className="container">
            <div className="tick-row" aria-hidden="true" data-reveal>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Impressions</span>
                <h2 className="h-1">Twenty years <em>on the ground</em>.</h2>
              </div>
              <p className="section-head__sub">From our head office to refinery lab floors across the UAE, Qatar and the wider Gulf — a few moments from how Chemparts works day to day.</p>
            </div>

            <div className="impressions-grid" data-reveal data-stagger>
              <figure className="impressions-tile impressions-tile--tall">
                <img src="/assets/images/photos/panoramic-industrial.jpg" alt="Gulf petroleum and chemical infrastructure where Chemparts instruments are deployed" loading="lazy" decoding="async" />
                <figcaption>
                  <span className="mono">— 001 / SECTOR · PETROLEUM</span>
                  <span className="impressions-tile__title">Where our instruments work.</span>
                  <span className="impressions-tile__desc">Analytical instruments deployed across the UAE, Qatar and the wider Gulf — refineries, terminals, petrochemical plants and university labs.</span>
                </figcaption>
              </figure>

              <figure className="impressions-tile impressions-tile--wide">
                <img src="/assets/images/photos/lab-engineer.jpg" alt="Chemparts application engineer at the bench in a customer's analytical lab" loading="lazy" decoding="async" />
                <figcaption>
                  <span className="mono">— 002 / FIELD · CUSTOMER LABS</span>
                  <span className="impressions-tile__title">Inside the labs we serve.</span>
                  <span className="impressions-tile__desc">Refinery QC, university research, environmental monitoring — our engineers are on customer benches every week.</span>
                </figcaption>
              </figure>

              <figure className="impressions-tile">
                <img src="/assets/images/photos/lab-analytics.jpg" alt="Analytical bench instrument analysing lubes, fuels and process-stream samples" loading="lazy" decoding="async" />
                <figcaption>
                  <span className="mono">— 003 / PROCESS · REFINERIES</span>
                  <span className="impressions-tile__title">Lubes, fuels &amp; process streams.</span>
                </figcaption>
              </figure>

              <figure className="impressions-tile">
                <img src="/assets/images/photos/gulf-port.jpg" alt="Sharjah industrial port — Chemparts logistics across the Gulf" loading="lazy" decoding="async" />
                <figcaption>
                  <span className="mono">— 004 / LOGISTICS · GULF</span>
                  <span className="impressions-tile__title">Same-day across the UAE.</span>
                </figcaption>
              </figure>
            </div>

            <div className="impressions-cta">
              <span className="mono">— Browse the analytical catalog</span>
              <a className="btn btn--primary" href="/products">See featured instruments <span className="arrow">→</span></a>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* WHAT WE DELIVER (4 capabilities) */}
        <section className="section" data-num="02 / 09 · What we deliver">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">What we deliver</span>
                <h2 className="h-1">Instruments are <em>where we start</em>.</h2>
              </div>
              <p className="section-head__sub">Chemparts is a full lifecycle partner — instruments, OEM spares, consumables and turnkey lab fit-outs. One PO, one accountable partner, one regional team.</p>
            </div>

            <div className="capabilities" data-reveal data-stagger>
              <article className="capability">
                <div className="capability__head">
                  <span className="capability__num">— 01 / Catalog</span>
                  <svg className="capability__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <rect x="8" y="6" width="32" height="36" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M14 14h20M14 22h20M14 30h12" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="32" cy="32" r="3" fill="currentColor" />
                  </svg>
                </div>
                <h3>Analytical instruments</h3>
                <p>Authorized distribution for {brandCount} specialist brands — XRF, flash point, distillation, mercury, NMR, FTIR, viscosity, RoHS and more. Full manufacturer warranty, factory-certified service.</p>
                <a className="capability__link" href="/products">Browse {instrumentCount} instruments <span className="arrow">→</span></a>
              </article>

              <article className="capability">
                <div className="capability__head">
                  <span className="capability__num">— 02 / OEM</span>
                  <svg className="capability__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M11 37l4-4M33 15l4-4" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </div>
                <h3>Genuine spare parts</h3>
                <p>OEM spares for every instrument we sell — held in regional stock, not parallel imports. No 6-week waits for a thermocouple, lamp, syringe pump or filter cartridge.</p>
                <a className="capability__link" href="/contact">Enquire spares <span className="arrow">→</span></a>
              </article>

              <article className="capability">
                <div className="capability__head">
                  <span className="capability__num">— 03 / Consumables</span>
                  <svg className="capability__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M16 6h16v8l8 18a4 4 0 01-4 6H12a4 4 0 01-4-6l8-18z" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M16 14h16M14 28h20" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="20" cy="34" r="1.5" fill="currentColor" />
                    <circle cx="28" cy="36" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3>Consumables &amp; reagents</h3>
                <p>Reference materials, calibration standards, sample cells, filter papers, vials, septa and lab consumables — NIST/NABL traceable where it matters. Recurring orders accepted.</p>
                <a className="capability__link" href="/contact">Request a list <span className="arrow">→</span></a>
              </article>

              <article className="capability capability--feature">
                <div className="capability__head">
                  <span className="capability__num">— 04 / Project</span>
                  <span className="pill pill--crimson">Featured</span>
                  <svg className="capability__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M6 42V14l18-8 18 8v28" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="14" y="22" width="8" height="20" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="26" y="22" width="8" height="14" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M14 30h8M26 28h8" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <h3>Turnkey lab solutions</h3>
                <p>Full lab fit-outs for petroleum QC, refinery on-line monitoring, university teaching labs and environmental compliance. Design, instrument selection, install, commissioning, training, AMC — single point of accountability.</p>
                <a className="capability__link" href="/contact">Scope a project <span className="arrow">→</span></a>
              </article>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* PROMPTBOX SEARCH (navigate to products) */}
        <section className="section" data-num="03 / 10 · Find by standard">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Find your instrument</span>
                <h2 className="h-1">Search by <em>standard</em>,<br />brand, or sample.</h2>
              </div>
              <p className="section-head__sub" style={{ textAlign: 'right' }}>Procurement teams search by ASTM/ISO/IP. Lab managers by sample type. Both work — type a method or paste an RFQ.</p>
            </div>

            <form className="promptbox" action="/products" method="get" data-promptbox>
              <div className="promptbox__label">
                <span className="mono">— PROMPT</span>
                <b>What standard do you need to comply with?</b>
              </div>
              <input className="promptbox__input" type="search" name="q" placeholder="flash point of jet fuel, ASTM D93..." aria-label="Search instruments by standard, brand or sample" />
              <button type="submit" className="btn btn--accent">Run search <span className="arrow">→</span></button>
            </form>

            <div className="promptbox__chips" role="group" aria-label="Common standards">
              <a className="chip" href="/products?q=ASTM%20D86">ASTM D86 <b>· 14</b></a>
              <a className="chip" href="/products?q=ASTM%20D93">ASTM D93 <b>· 09</b></a>
              <a className="chip" href="/products?q=ASTM%20D4294">ASTM D4294 <b>· 06</b></a>
              <a className="chip" href="/products?q=ISO%208754">ISO 8754 <b>· 05</b></a>
              <a className="chip" href="/products?q=IP%20336">IP 336 <b>· 04</b></a>
              <a className="chip" href="/products?q=ASTM%20D2622">ASTM D2622</a>
              <a className="chip" href="/products?q=ASTM%20D5453">ASTM D5453</a>
              <a className="chip" href="/products?q=ISO%2017025">ISO 17025</a>
              <a className="chip" href="/products?q=RoHS">RoHS screening</a>
              <a className="chip" href="/products?q=Karl%20Fischer">Karl Fischer</a>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* INDUSTRIES */}
        <section className="section section--tight section--slate" data-num="04 / 10 · Sectors we serve">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Sectors</span>
                <h2 className="h-2">Industries we <em>serve</em>.</h2>
              </div>
              <p className="section-head__sub">Twenty years of fieldwork across the UAE, Qatar and the most demanding analytical applications in the Gulf.</p>
            </div>

            <div className="industries-grid" data-stagger>

              <a className="industry-card industry-card--c1" href="/products#%7B%22i%22%3A%5B%22petroleum%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 01 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <rect x="14" y="34" width="20" height="48" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="38" y="22" width="20" height="60" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="62" y="44" width="20" height="38" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 50h20M14 66h20M38 38h20M38 54h20M38 70h20M62 60h20M62 72h20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <path d="M48 22V8M48 8l-4 4M48 8l4 4" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="48" cy="14" r="3" fill="currentColor" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Petroleum &amp; Fuels</h3>
                  </div>
                  <p>Flash point, distillation, sulphur, vapor pressure and the full ASTM/ISO petroleum suite.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="petroleum">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c2" href="/products#%7B%22i%22%3A%5B%22refineries%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 02 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <path d="M8 80h80M14 80V42l8-6v44M22 80V36l8-6v50M30 80V30l8 4v46M38 80V34l12 8v38M50 80V42l10 6v32M60 80V48l10 4v28M70 80V52l10-2v30" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="78" cy="22" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M78 16v-4M78 28v4M84 22h4M68 22h4" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Refineries</h3>
                  </div>
                  <p>Lubricants, base oils, finished fuels, additives and process-stream monitoring.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="refineries">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c3" href="/products#%7B%22i%22%3A%5B%22plastics%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 03 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <path d="M48 14L80 32v32L48 82 16 64V32z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M48 14v34M48 48L16 32M48 48L80 32M48 48v34" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                    <circle cx="48" cy="48" r="4" fill="currentColor" />
                    <circle cx="32" cy="40" r="2" fill="currentColor" opacity="0.6" />
                    <circle cx="64" cy="40" r="2" fill="currentColor" opacity="0.6" />
                    <circle cx="48" cy="68" r="2" fill="currentColor" opacity="0.6" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Plastics &amp; Polymers</h3>
                  </div>
                  <p>RoHS screening, melt flow, thermal analysis and elemental composition for polymer labs.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="plastics">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c4" href="/products#%7B%22i%22%3A%5B%22environmental%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 04 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <circle cx="48" cy="48" r="32" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 48h64M48 16c10 9 10 55 0 64M48 16c-10 9-10 55 0 64M22 30c8 6 44 6 52 0M22 66c8-6 44-6 52 0" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                    <circle cx="32" cy="36" r="2" fill="currentColor" />
                    <circle cx="62" cy="58" r="2" fill="currentColor" />
                    <circle cx="56" cy="30" r="1.5" fill="currentColor" opacity="0.6" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Environmental</h3>
                  </div>
                  <p>Water, soil, air-quality and emissions monitoring — heavy metals, organics and trace contaminants.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="environmental">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c5" href="/products#%7B%22i%22%3A%5B%22food%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 05 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <path d="M30 16h36v22a18 18 0 01-36 0z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M30 38h36" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                    <path d="M48 56v18M40 80h16" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="42" cy="28" r="2" fill="currentColor" />
                    <circle cx="50" cy="32" r="2" fill="currentColor" />
                    <circle cx="56" cy="26" r="2" fill="currentColor" />
                    <path d="M16 84c4-8 12-8 16 0M64 84c4-8 12-8 16 0" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Food &amp; Water</h3>
                  </div>
                  <p>Heavy metals, contaminants, nutrients and water-quality testing for food and beverage labs.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="food">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c6" href="/products#%7B%22i%22%3A%5B%22materials%22%5D%7D">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 06 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    <path d="M14 28l34-12 34 12-34 12z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 48l34 12 34-12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 68l34 12 34-12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 28v40M48 40v40M82 28v40" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Materials &amp; Coatings</h3>
                  </div>
                  <p>Coatings, films, adhesives, composites — surface analysis and material characterization.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><span data-industry-count="materials">[—]</span> instruments</span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

              <a className="industry-card industry-card--c7" href="/products?q=university">
                <div className="industry-card__hero" aria-hidden="true">
                  <span className="industry-card__num">— 07 / SECTOR</span>
                  <svg className="industry-card__big" viewBox="0 0 96 96" fill="none">
                    {/* mortarboard / academia glyph */}
                    <path d="M48 18L8 34l40 16 40-16-40-16z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M22 42v18c0 4 12 10 26 10s26-6 26-10V42" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M88 34v22" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="88" cy="58" r="3" fill="currentColor" />
                  </svg>
                </div>
                <div className="industry-card__body">
                  <div className="industry-card__head">
                    <h3>Academic &amp; Research</h3>
                  </div>
                  <p>Turnkey lab fit-outs for universities, colleges, schools and research centres across the Gulf — equipment, reagents, consumables, training.</p>
                  <div className="industry-card__foot">
                    <span className="mono"><strong>FULL TURNKEY</strong></span>
                    <svg className="industry-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.4" /></svg>
                  </div>
                </div>
              </a>

            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* ACADEMIC SECTION (rich content) */}
        <section className="section section--slate">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Academic &amp; research focus</span>
                <h2 className="h-1">Equipping the Gulf&apos;s <em>universities</em>, schools and research centres.</h2>
              </div>
              <p className="section-head__sub">A dedicated practice within Chemparts — laboratory equipment, complete turnkey lab solutions, and ongoing technical support for the academic sector across the Middle East.</p>
            </div>

            <div className="academic-grid" data-reveal data-stagger>
              <article className="academic-card">
                <span className="academic-card__num">— 01 / Turnkey</span>
                <h3>End-to-end lab solutions</h3>
                <p>From design and instrument selection to install, commissioning, training and AMC — everything a university lab needs from a single accountable partner.</p>
              </article>
              <article className="academic-card">
                <span className="academic-card__num">— 02 / Coverage</span>
                <h3>Schools to research centres</h3>
                <p>Active partnerships with the entire academic ecosystem: schools, colleges, universities and advanced research institutions across the Gulf.</p>
              </article>
              <article className="academic-card">
                <span className="academic-card__num">— 03 / Catalog</span>
                <h3>Beyond instruments</h3>
                <p>Reference standards, chemicals, reagents and consumables held in regional stock — keeping student labs running without lead-time delays.</p>
              </article>
              <article className="academic-card">
                <span className="academic-card__num">— 04 / Service</span>
                <h3>Long-term value</h3>
                <p>Dedicated service support, technical assistance and after-sales service. Quality and reliability that strengthens lab infrastructure year after year.</p>
              </article>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* ENGINEERING & SERVICE */}
        <section className="section service-section" data-num="04 / 09 · Engineers on the ground">
          <div className="container">
            <div className="service-head" data-reveal>
              <div className="service-head__lhs">
                <span className="eyebrow">Engineering &amp; service · Chemparts</span>
                <h2 className="h-1">Engineers on the <em>ground</em>.</h2>
              </div>
              <figure className="service-photo">
                <img src="/assets/images/photos/team-meeting.jpg" alt="Chemparts engineering team reviewing instrument schematics in the Sharjah office" loading="lazy" decoding="async" />
                <figcaption><span className="mono">— Chemparts engineering team · Sharjah</span></figcaption>
              </figure>
              <div className="service-head__rhs">
                <p className="body-lg">The <strong>Chemparts</strong> team is not a call centre. Trained application engineers and factory-certified service technicians across the <strong>UAE</strong> and <strong>Qatar</strong> — same time zone as your lab, same-day response, same standards your auditors expect.</p>
                <a className="btn btn--primary" href="/contact">Talk to a service engineer <span className="arrow">→</span></a>
              </div>
            </div>

            <div className="service-grid" data-reveal data-stagger>
              <article className="service-card">
                <div className="service-card__head">
                  <span className="service-card__num">— 01</span>
                  <span className="service-card__icon" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4l10 6v12L16 28 6 22V10z" stroke="currentColor" strokeWidth="1.25" />
                      <path d="M16 4v12L26 22M16 16L6 22M16 16V28" stroke="currentColor" strokeWidth="1.25" />
                    </svg>
                  </span>
                </div>
                <h3>Application engineering</h3>
                <p>Method selection, sample suitability, sample-prep workflow design, and calibration plans referenced to the exact <strong>ASTM / ISO / IP</strong> method you need to comply with.</p>
                <ul className="service-card__list">
                  <li>Standards-driven shortlists</li>
                  <li>On-site method demos</li>
                  <li>SOP &amp; calibration plan support</li>
                </ul>
              </article>

              <article className="service-card">
                <div className="service-card__head">
                  <span className="service-card__num">— 02</span>
                  <span className="service-card__icon" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M6 22l10-14 10 14M10 22l6-9 6 9M14 28h4M16 22v6" stroke="currentColor" strokeWidth="1.25" />
                      <circle cx="16" cy="14" r="2" fill="currentColor" />
                    </svg>
                  </span>
                </div>
                <h3>Field service</h3>
                <p>On-site installation, preventive maintenance, repair and emergency call-outs across the UAE, Qatar and the wider Gulf region. <strong>Working-day response</strong> within the Gulf, factory-certified engineers.</p>
                <ul className="service-card__list">
                  <li>Installation &amp; commissioning</li>
                  <li>Annual maintenance contracts</li>
                  <li>Genuine spare parts in-region</li>
                </ul>
              </article>

              <article className="service-card">
                <div className="service-card__head">
                  <span className="service-card__num">— 03</span>
                  <span className="service-card__icon" aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M6 26h20M10 22V12M16 22V6M22 22V14M8 26v-2h4v2M14 26v-2h4v2M20 26v-2h4v2" stroke="currentColor" strokeWidth="1.25" />
                    </svg>
                  </span>
                </div>
                <h3>Calibration &amp; validation</h3>
                <p>Reference materials, calibration certificates and IQ/OQ/PQ validation support throughout the instrument lifecycle. Documentation matched to your QMS audit requirements.</p>
                <ul className="service-card__list">
                  <li>Reference materials &amp; consumables</li>
                  <li>NABL / ISO 17025 traceable</li>
                  <li>Validation document packs</li>
                </ul>
              </article>
            </div>

            <div className="service-stats" data-reveal>
              <div><span className="num num-display">&lt;1</span><span className="lbl">Working-day response</span></div>
              <div><span className="num num-display">3</span><span className="lbl">Engineering hubs across UAE &amp; Qatar</span></div>
              <div><span className="num num-display">100%</span><span className="lbl">Factory-certified engineers</span></div>
              <div><span className="num num-display">24/7</span><span className="lbl">Emergency line for AMC clients</span></div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* PROCESS / HOW WE WORK */}
        <section className="section" data-num="05 / 09 · How we work">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">How we work</span>
                <h2 className="h-1">From your <em>method</em> to your bench.</h2>
              </div>
              <p className="section-head__sub">Five working-day-paced steps. No black-box procurement, no surprise lead-times.</p>
            </div>

            <ol className="process" data-reveal data-stagger>
              <li className="process__step">
                <span className="process__num">01</span>
                <span className="process__title">Send the standard</span>
                <p className="process__desc">Email or WhatsApp the ASTM/ISO/IP method, sample type and rough throughput. Same day acknowledgment.</p>
                <svg className="process__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="32" height="32" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M14 18h20M14 24h20M14 30h12" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </li>
              <li className="process__step">
                <span className="process__num">02</span>
                <span className="process__title">Get a shortlist</span>
                <p className="process__desc">2–3 instruments referenced to the standard, with calibration plan, sample-prep notes and consumables list.</p>
                <svg className="process__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M8 24l10 10 22-22" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="34" cy="14" r="3" fill="currentColor" />
                </svg>
              </li>
              <li className="process__step">
                <span className="process__num">03</span>
                <span className="process__title">Approve the quote</span>
                <p className="process__desc">Quote with full warranty terms. PO accepted by email or via your procurement portal.</p>
                <svg className="process__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="10" y="6" width="28" height="36" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M16 16h16M16 22h16M16 28h10M28 36l4 4 8-8" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </li>
              <li className="process__step">
                <span className="process__num">04</span>
                <span className="process__title">Delivery &amp; install</span>
                <p className="process__desc">Shipped from regional stock when available. On-site commissioning, IQ/OQ/PQ documentation included.</p>
                <svg className="process__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M6 28h28v10H6zM34 22h6l4 6v10h-10zM12 38a3 3 0 1 0 6 0 3 3 0 1 0-6 0M34 38a3 3 0 1 0 6 0 3 3 0 1 0-6 0" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </li>
              <li className="process__step">
                <span className="process__num">05</span>
                <span className="process__title">Service for life</span>
                <p className="process__desc">AMC contracts, calibration cycles, spares in-region. Same engineers across the lifetime of the instrument.</p>
                <svg className="process__icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M24 14v10l7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="24" cy="24" r="2" fill="currentColor" />
                </svg>
              </li>
            </ol>
          </div>
        </section>

        <hr className="rule" />

        {/* WHY CHEMPARTS */}
        <section className="section section--slate" data-num="06 / 09 · Why Chemparts">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Why Chemparts</span>
                <h2 className="h-1">Engineered for <em>credibility</em>.</h2>
              </div>
              <p className="section-head__sub">Six reasons procurement and lab managers across the UAE, Qatar and the wider Gulf shortlist us first.</p>
            </div>
            <div className="strengths-grid" data-reveal data-stagger>
              <div className="strength"><span className="strength__num">— 01</span><h3 className="strength__title">Authorized distribution</h3><p className="strength__desc">Direct partnerships with Hitachi, Tanaka, Oxford, KEM and 14 more — full warranty, not parallel imports.</p></div>
              <div className="strength"><span className="strength__num">— 02</span><h3 className="strength__title">Application support</h3><p className="strength__desc">In-house specialists with petroleum, refinery and materials lab backgrounds — not generic sales.</p></div>
              <div className="strength"><span className="strength__num">— 03</span><h3 className="strength__title">On-ground service</h3><p className="strength__desc">Engineering teams across the UAE and Qatar. Working-day response across the entire Gulf region.</p></div>
              <div className="strength"><span className="strength__num">— 04</span><h3 className="strength__title">Standards-first</h3><p className="strength__desc">Every quote references the ASTM, ISO or IP method you actually need to comply with.</p></div>
              <div className="strength"><span className="strength__num">— 05</span><h3 className="strength__title">Calibration &amp; consumables</h3><p className="strength__desc">Reference materials, spare parts and calibration support throughout the instrument lifecycle.</p></div>
              <div className="strength"><span className="strength__num">— 06</span><h3 className="strength__title">ISO 9001 &amp; 14001</h3><p className="strength__desc">Quality and environment management certified — the same systems your auditors expect.</p></div>
            </div>
          </div>
        </section>

        {/* CLIENTS MARQUEE — DB-driven (staff-managed via /staff/clients) */}
        <ClientMarquee />

        {/* PARTNERS MARQUEE — DB-driven (reflects staff brand edits) */}
        <BrandMarquee />

        <hr className="rule" />

        {/* TESTIMONIALS */}
        <section className="section section--dark" data-num="07 / 09 · Voices from the field">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Voices from the field</span>
                <h2 className="h-1">What lab managers <em>actually say</em>.</h2>
              </div>
              <p className="section-head__sub">Verbatim feedback from procurement and lab managers across the Gulf — anonymized on request.</p>
            </div>

            <div className="testimonials" data-reveal data-stagger>
              <figure className="testimonial">
                <span className="testimonial__quote">&quot;</span>
                <blockquote>The Chemparts engineer turned up on a Sunday morning when our flash-point tester went down before a refinery audit. Calibrated, certified, gone by lunch. That&apos;s the standard.</blockquote>
                <figcaption>
                  <strong>Lab Manager</strong>
                  <span className="mono">— Refinery operations · Abu Dhabi · 2025</span>
                </figcaption>
              </figure>
              <figure className="testimonial">
                <span className="testimonial__quote">&quot;</span>
                <blockquote>Two quotes from European distributors took six weeks each. Chemparts came back the same afternoon with three options, every one referencing the exact ASTM revision we needed.</blockquote>
                <figcaption>
                  <strong>Procurement Lead</strong>
                  <span className="mono">— National oil company · 2024</span>
                </figcaption>
              </figure>
              <figure className="testimonial">
                <span className="testimonial__quote">&quot;</span>
                <blockquote>We replaced our XRF, mercury analyzer and a closed-cup tester through Chemparts in the same FY. Single PO, single point of accountability, full IQ/OQ/PQ documentation.</blockquote>
                <figcaption>
                  <strong>QA/QC Director</strong>
                  <span className="mono">— Petrochemical lab · Sharjah · 2025</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* CERTIFICATIONS BAND */}
        <section className="section section--tight cert-band" data-num="08 / 09 · Standards & credentials">
          <div className="container">
            <div className="cert-band__inner" data-reveal data-stagger>
              <div className="cert-badge">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M22 33l8 8 14-16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <div>
                  <strong>ISO 9001:2015</strong>
                  <span>Quality management system</span>
                </div>
              </div>
              <div className="cert-badge">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M32 16c-6 8-10 14-10 22a10 10 0 0020 0c0-8-4-14-10-22z" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <div>
                  <strong>ISO 14001:2015</strong>
                  <span>Environmental management</span>
                </div>
              </div>
              <div className="cert-badge">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M32 6l24 8v18c0 12-10 22-24 26-14-4-24-14-24-26V14z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M22 32l8 8 14-16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <div>
                  <strong>Authorized partner</strong>
                  <span>Hitachi · Tanaka · Oxford · 13 more</span>
                </div>
              </div>
              <div className="cert-badge">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <rect x="10" y="14" width="44" height="36" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M18 24h28M18 32h28M18 40h18" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <div>
                  <strong>ASTM · ISO · IP</strong>
                  <span>Standards-referenced quotes</span>
                </div>
              </div>
              <div className="cert-badge cert-badge--feature">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M32 4l28 14v18c0 12-12 24-28 28-16-4-28-16-28-28V18z" stroke="currentColor" strokeWidth="1.4" />
                  <text x="32" y="38" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="14" fontWeight="700" fill="currentColor">ICV</text>
                </svg>
                <div>
                  <strong>ICV Certified</strong>
                  <span>Abu Dhabi · ADNOC procurement panel</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* PULL QUOTE */}
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }} data-reveal>
            <blockquote className="pull-quote">
              &quot;A customer is the most important visitor in our premises. He is not dependent on us. We are dependent on him.&quot;
              <span className="pull-quote-attribution">— OUR CUSTOMER PHILOSOPHY</span>
            </blockquote>
          </div>
        </section>

        {/* FINAL CTA BAND */}
        <section className="section section--tight cta-band" data-num="09 / 09 · Next step">
          <div className="container cta-band__inner" data-reveal>
            <span className="eyebrow">Next step</span>
            <h2 className="h-1">Ready to find your <em>instrument?</em></h2>
            <p className="body-lg" style={{ textAlign: 'center' }}>Tell us your standard, sample or budget. Our team will reply with options and a quote — usually the same working day.</p>
            <div className="actions">
              <a className="btn btn--whatsapp" href="https://wa.me/971557566123?text=Hello%20Chemparts%2C%20I%27d%20like%20to%20discuss%20an%20instrument%20requirement." target="_blank" rel="noopener">WhatsApp +971 55 756 6123 <span className="arrow">→</span></a>
              <a className="btn btn--ghost" href="/contact">Contact form</a>
            </div>
          </div>
        </section>

    </main>
  )
}
