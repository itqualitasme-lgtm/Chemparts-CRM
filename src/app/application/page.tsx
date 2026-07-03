import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import SiteChrome from '@/components/site/SiteChrome'

export const dynamic = 'force-dynamic'

export default function ApplicationPage() {
  return (
    <>
      <SiteHeader activeNav="application" />

      <main id="main">
        <section className="section">
          <div className="container">
            <div className="coord">
              <span>004 / APPLICATION</span>
              <span>METHOD-LED</span>
              <span>FIELD-PROVEN</span>
            </div>
            <div className="about-hero about-hero--flipped" data-reveal>
              <div className="about-hero__copy">
                <span className="eyebrow">Application support</span>
                <h1 className="h-display">Method first, <em>instrument</em> second.</h1>
                <p className="body-lg">We work backwards from the standard you need to comply with — ASTM, ISO, IP — to the right instrument, calibration plan and consumable list.</p>
              </div>
              <figure className="about-hero__photo">
                <img src="/assets/images/photos/lab-analytics.jpg" alt="Analytical bench instruments — Chemparts method-led application support" loading="lazy" decoding="async" />
                <figcaption><span className="mono">— METHOD VALIDATION · ASTM</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Coverage</span>
                <h2 className="h-1">What we <em>support</em>.</h2>
              </div>
            </div>
            <div className="strengths-grid" data-reveal>
              <div className="strength"><span className="strength__num">— 01 / PETROLEUM</span><h3 className="strength__title">Fuel &amp; lubricant labs</h3><p className="strength__desc">Flash point, distillation, sulphur, aniline, pour/cloud — full ASTM/ISO method coverage.</p></div>
              <div className="strength"><span className="strength__num">— 02 / REFINERIES</span><h3 className="strength__title">Refinery on-line QC</h3><p className="strength__desc">Bench-top XRF, mercury, chlorine — production-line workflow design.</p></div>
              <div className="strength"><span className="strength__num">— 03 / MATERIALS</span><h3 className="strength__title">Materials &amp; coatings</h3><p className="strength__desc">XRF coating thickness, polymer NMR, FTIR identification.</p></div>
              <div className="strength"><span className="strength__num">— 04 / ENVIRONMENTAL</span><h3 className="strength__title">Environmental monitoring</h3><p className="strength__desc">Mercury (EPA 7473), trace metals, volatile organics.</p></div>
              <div className="strength"><span className="strength__num">— 05 / FOOD &amp; WATER</span><h3 className="strength__title">Food &amp; water QA</h3><p className="strength__desc">Mineral analysis, contamination screening, regulatory reporting.</p></div>
              <div className="strength"><span className="strength__num">— 06 / EDUCATION</span><h3 className="strength__title">Universities &amp; teaching labs</h3><p className="strength__desc">Robust, well-documented instruments scaled for student throughput.</p></div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">How we work</span>
                <h2 className="h-1">A working-day <em>workflow</em>.</h2>
              </div>
            </div>
            <div className="strengths-grid" data-reveal>
              <div className="strength"><span className="strength__num">— STEP 01</span><h3 className="strength__title">Standard &amp; sample</h3><p className="strength__desc">Send us the ASTM / ISO / IP method and a description of your sample.</p></div>
              <div className="strength"><span className="strength__num">— STEP 02</span><h3 className="strength__title">Shortlist</h3><p className="strength__desc">We come back with 2–3 instruments that meet the spec, with calibration plan.</p></div>
              <div className="strength"><span className="strength__num">— STEP 03</span><h3 className="strength__title">Quote &amp; deliver</h3><p className="strength__desc">Quote with full warranty terms. On-site commissioning included.</p></div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* STANDARDS REFERENCE TABLE */}
        <section className="section section--slate">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Standards reference</span>
                <h2 className="h-1">Common <em>standards</em>, mapped to instruments.</h2>
              </div>
              <p className="section-head__sub">A working list of the methods labs across the UAE, Qatar and the wider Gulf request most often. Not exhaustive — contact us for any standard not listed.</p>
            </div>

            <div className="standards-ref" data-reveal>
              <div className="standards-ref__row standards-ref__row--head">
                <div>Method</div>
                <div>What it measures</div>
                <div>Typical instrument</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D86</div>
                <div>Atmospheric distillation of petroleum products and liquid fuels</div>
                <div className="standards-ref__instr">Tanaka AD-7</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D93</div>
                <div>Closed-cup flash point — Pensky-Martens method</div>
                <div className="standards-ref__instr">Tanaka APM-100</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D92</div>
                <div>Open-cup flash &amp; fire point — Cleveland method</div>
                <div className="standards-ref__instr">Tanaka ACO-8</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D4294</div>
                <div>Sulphur in petroleum and petroleum products by EDXRF</div>
                <div className="standards-ref__instr">Hitachi LAB-X5000 / X-Supreme 8000</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D5453</div>
                <div>Total sulphur in light hydrocarbons by UV fluorescence</div>
                <div className="standards-ref__instr">Tanaka TS-2100</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D611</div>
                <div>Aniline point and mixed aniline point of petroleum products</div>
                <div className="standards-ref__instr">Tanaka AAP-6</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ASTM D5762</div>
                <div>Nitrogen in petroleum and petroleum products by chemiluminescence</div>
                <div className="standards-ref__instr">Tanaka TN-6000</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">EPA 7473</div>
                <div>Mercury in solids and solutions by direct combustion / amalgamation</div>
                <div className="standards-ref__instr">Lumex / Hitachi mercury analyzer</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ISO 2592</div>
                <div>Determination of flash and fire points — Cleveland open-cup method</div>
                <div className="standards-ref__instr">Tanaka ACO-8</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">ISO 8754</div>
                <div>Sulphur content of petroleum products — EDXRF method</div>
                <div className="standards-ref__instr">Hitachi X-Supreme 8000</div>
              </div>
              <div className="standards-ref__row">
                <div className="standards-ref__code">IP 336</div>
                <div>Sulphur in petroleum products by EDXRF (UK Energy Institute)</div>
                <div className="standards-ref__instr">Hitachi LAB-X5000</div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* FAQ */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">FAQ</span>
                <h2 className="h-1">Common <em>questions</em>.</h2>
              </div>
              <p className="section-head__sub">Things procurement and lab managers ask most often. Don&apos;t see yours? Talk to us.</p>
            </div>

            <div className="faq-list" data-reveal>
              <details className="faq-item">
                <summary>How fast can you turn around a quote?</summary>
                <div className="faq-item__body">
                  <p>Same working day for stocked instruments. <strong>2–3 working days</strong> if we need the manufacturer to confirm a non-standard configuration or a long-lead consumable. WhatsApp is the fastest channel.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Do you supply against ASTM, ISO and IP method numbers, or by product code?</summary>
                <div className="faq-item__body">
                  <p>Both — and we prefer the standard. Send us the method number and your sample type, and we&apos;ll come back with the instrument shortlist that meets it. Quotes always reference the exact standard revision your auditor will accept.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Are calibration certificates traceable?</summary>
                <div className="faq-item__body">
                  <p>Yes. All calibrations are NIST or NABL traceable. We provide IQ / OQ / PQ documentation packs on request, accepted by every Gulf-region auditor we&apos;ve worked with.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Do you cover after-sales service in the UAE and Qatar?</summary>
                <div className="faq-item__body">
                  <p>Three engineering teams — Sharjah, Abu Dhabi, Doha — with <strong>same working-day response</strong> across the UAE and Qatar. Annual maintenance contracts (AMC) include preventive maintenance, calibration cycles, and 24/7 emergency line.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>What happens if my instrument fails outside warranty?</summary>
                <div className="faq-item__body">
                  <p>We carry genuine OEM spares for all anchor brands (Hitachi, Tanaka, Oxford) in regional stock. Most field repairs are completed within the same working day; complex repairs may take 3–5 days depending on parts availability.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Can you source instruments from brands you don&apos;t list?</summary>
                <div className="faq-item__body">
                  <p>Often, yes. Through our partner network we can source instruments outside our authorized catalog when a specific lab requires it. Tell us the manufacturer, model and intended method — we&apos;ll come back with options and lead-times.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Do you accept government / national-oil-company purchase orders?</summary>
                <div className="faq-item__body">
                  <p>Yes. We&apos;re approved on the procurement panels of multiple Gulf national oil companies and university procurement portals. POs accepted by email, EDI, or your portal of choice.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section section--tight cta-band">
          <div className="container cta-band__inner" data-reveal>
            <span className="eyebrow">Talk to a specialist</span>
            <h2 className="h-1">Send us your <em>method</em>.</h2>
            <div className="actions">
              <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp +971 55 756 6123 <span className="arrow">→</span></a>
              <a className="btn btn--ghost" href="/contact">Use the contact form</a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <SiteChrome />
    </>
  )
}
