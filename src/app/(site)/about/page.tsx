import AboutMapSync from './AboutMapSync'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <>
      <main id="main">

        {/* HERO */}
        <section className="section">
          <div className="container">
            <div className="coord">
              <span>002 / ABOUT</span>
              <span>EST. 2003</span>
              <span>UAE · QATAR · GULF REGION</span>
            </div>
            <div className="about-hero" data-reveal>
              <div className="about-hero__copy">
                <span className="eyebrow">About Chemparts</span>
                <h1 className="h-display">Two decades of <em>precision</em>, in service of science.</h1>
                <p className="body-lg">Chemparts Middle East FZC supplies <strong>analytical instruments, OEM spare parts, consumables and turnkey lab solutions</strong> to refineries, universities and national labs across the Gulf - Sharjah HQ since 2003, branches in Abu Dhabi and Doha.</p>
              </div>
              <figure className="about-hero__photo">
                <img src="/assets/images/photos/chem-lab.jpg" alt="Analytical chemistry workflow in the Chemparts Sharjah laboratory" loading="lazy" decoding="async" />
                <figcaption><span className="mono">— LAB · SHARJAH HQ</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* MISSION VISION VALUES */}
        <section className="section">
          <div className="container">
            <div className="strengths-grid" data-reveal>
              <div className="strength">
                <span className="strength__num">— 01 / MISSION</span>
                <h3 className="strength__title">Make instrumentation accessible</h3>
                <p className="strength__desc">To put the right analytical instrument, calibration and method support in the hands of every lab and refinery across the UAE, Qatar and the wider Gulf — without the friction of remote vendor relationships.</p>
              </div>
              <div className="strength">
                <span className="strength__num">— 02 / VISION</span>
                <h3 className="strength__title">The region&apos;s most credible distributor</h3>
                <p className="strength__desc">To be the partner that procurement and lab managers shortlist first, because the spec is right, the standards are referenced, and the service is local.</p>
              </div>
              <div className="strength">
                <span className="strength__num">— 03 / VALUES</span>
                <h3 className="strength__title">Standards, not slogans</h3>
                <p className="strength__desc">We talk in ASTM, ISO and IP method numbers. We don&apos;t oversell, we don&apos;t substitute, and we don&apos;t compromise on the calibration certificate.</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* TIMELINE */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Our history</span>
                <h2 className="h-1">Two decades on the <em>ground</em>.</h2>
              </div>
              <p className="section-head__sub">From a single SAIF Zone office to three regional teams.</p>
            </div>

            <div className="timeline" data-reveal>
              <div className="timeline__row"><span className="timeline__year">2003</span><div className="timeline__body"><h3>Founded in SAIF Zone, Sharjah</h3><p>Chemparts Middle East FZC opens its head office to distribute analytical instruments to UAE refineries and labs.</p></div></div>
              <div className="timeline__row"><span className="timeline__year">2008</span><div className="timeline__body"><h3>Abu Dhabi office opens</h3><p>Chemparts Medical &amp; Laboratory Supplies LLC established to serve ADNOC, GASCO and Abu Dhabi-based research institutions.</p></div></div>
              <div className="timeline__row"><span className="timeline__year">2015</span><div className="timeline__body"><h3>Doha branch opens</h3><p>Qatar operation launched in New Souq Al Haraj to support Qatar Energy and Qatar Energy LNG.</p></div></div>
              <div className="timeline__row"><span className="timeline__year">2020</span><div className="timeline__body"><h3>ISO 9001 &amp; 14001 certified</h3><p>Quality management and environmental management systems formally certified across all three offices.</p></div></div>
              <div className="timeline__row"><span className="timeline__year">2022</span><div className="timeline__body"><h3>ICV certification - Abu Dhabi</h3><p>Chemparts Medical &amp; Laboratory Supplies LLC achieves <strong>In-Country Value (ICV)</strong> certification, meeting Abu Dhabi government and ADNOC procurement requirements for in-region economic contribution.</p></div></div>
              <div className="timeline__row"><span className="timeline__year">2026</span><div className="timeline__body"><h3>Today</h3><p>500+ active clients, 16+ brand partners, three engineering teams. <strong>ICV-certified</strong> for ADNOC group procurement, ISO 9001 &amp; 14001 across all offices, full lifecycle: instruments, OEM spares, consumables, turnkey lab solutions.</p></div></div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* MAP / OFFICES */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Geography</span>
                <h2 className="h-2">Three offices, two <em>countries</em>.</h2>
              </div>
              <p className="section-head__sub">Working-day response across the UAE, Qatar and the wider Gulf region.</p>
            </div>

            <div className="map-block" data-reveal>
              <div className="map-frame map-frame--custom">
                <svg className="gulf-map" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of UAE and Qatar showing Chemparts office locations">
                  <defs>
                    <pattern id="gulf-grid" width="35" height="35" patternUnits="userSpaceOnUse">
                      <path d="M 35 0 L 0 0 0 35" fill="none" stroke="rgba(53,118,158,0.10)" strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="water-fade" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#E4EEF5" />
                      <stop offset="1" stopColor="#F4F6F9" />
                    </linearGradient>
                    <linearGradient id="land-fade" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#F0F3F6" />
                    </linearGradient>
                  </defs>

                  {/* Water background */}
                  <rect width="700" height="500" fill="url(#water-fade)" />
                  <rect width="700" height="500" fill="url(#gulf-grid)" />

                  {/* Persian Gulf label */}
                  <text x="280" y="120" fontFamily="Geist Mono, monospace" fontSize="11" fill="rgba(53,118,158,0.55)" letterSpacing="3" textAnchor="middle">PERSIAN GULF</text>

                  {/* Iran coastline (top edge, suggestive only) */}
                  <path d="M 0 70 C 100 60, 200 50, 300 55 C 420 60, 540 75, 700 50 L 700 0 L 0 0 Z"
                    fill="url(#land-fade)" stroke="rgba(53,118,158,0.35)" strokeWidth="0.8" />

                  {/* Qatar peninsula (bottom-left, sticking up) */}
                  <path d="M 130 500 L 130 280 C 132 250, 145 230, 165 225 C 188 220, 200 240, 200 270 L 198 320 C 195 360, 180 400, 160 440 L 155 500 Z"
                    fill="url(#land-fade)" stroke="rgba(53,118,158,0.45)" strokeWidth="0.8" />

                  {/* Saudi Arabia / UAE landmass (large shape filling bottom-right) */}
                  <path d="M 0 500 L 0 230 C 80 240, 130 260, 170 285
                     L 220 320 C 260 330, 320 340, 380 350
                     C 430 358, 480 365, 530 360
                     C 575 355, 600 340, 620 320
                     C 640 290, 645 250, 640 220
                     C 630 180, 620 150, 615 130
                     C 615 110, 625 100, 640 90
                     L 700 80 L 700 500 Z"
                    fill="url(#land-fade)" stroke="rgba(53,118,158,0.45)" strokeWidth="0.8" />

                  {/* Musandam peninsula tip (UAE/Oman) */}
                  <path d="M 615 130 C 625 110, 640 105, 650 115 C 658 125, 655 145, 645 155 C 635 160, 625 145, 615 130 Z"
                    fill="url(#land-fade)" stroke="rgba(53,118,158,0.45)" strokeWidth="0.8" />

                  {/* Country labels */}
                  <text x="80" y="430" fontFamily="Geist Mono, monospace" fontSize="10" fill="rgba(10,37,64,0.45)" letterSpacing="2">SAUDI ARABIA</text>
                  <text x="155" y="490" fontFamily="Geist Mono, monospace" fontSize="10" fill="rgba(10,37,64,0.55)" letterSpacing="2" textAnchor="middle">QATAR</text>
                  <text x="500" y="430" fontFamily="Geist Mono, monospace" fontSize="10" fill="rgba(10,37,64,0.55)" letterSpacing="2">UNITED ARAB EMIRATES</text>

                  {/* Office pins (group with hover targets) */}
                  <g className="gulf-pin" data-city="doha">
                    <circle className="gulf-pin__ring" cx="155" cy="270" r="22" />
                    <circle className="gulf-pin__halo" cx="155" cy="270" r="14" />
                    <circle className="gulf-pin__dot" cx="155" cy="270" r="5" />
                    <line x1="155" y1="265" x2="155" y2="195" stroke="rgba(200,16,46,0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="155" y="186" fontFamily="Geist Mono, monospace" fontSize="11" fill="#0A2540" fontWeight="500" textAnchor="middle">DOHA</text>
                    <text x="155" y="174" fontFamily="Geist Mono, monospace" fontSize="8" fill="rgba(10,37,64,0.55)" textAnchor="middle">03 / BRANCH</text>
                  </g>

                  <g className="gulf-pin" data-city="abu-dhabi">
                    <circle className="gulf-pin__ring" cx="445" cy="320" r="22" />
                    <circle className="gulf-pin__halo" cx="445" cy="320" r="14" />
                    <circle className="gulf-pin__dot" cx="445" cy="320" r="5" />
                    <line x1="445" y1="325" x2="445" y2="395" stroke="rgba(200,16,46,0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="445" y="412" fontFamily="Geist Mono, monospace" fontSize="11" fill="#0A2540" fontWeight="500" textAnchor="middle">ABU DHABI</text>
                    <text x="445" y="424" fontFamily="Geist Mono, monospace" fontSize="8" fill="rgba(10,37,64,0.55)" textAnchor="middle">02 / BRANCH</text>
                  </g>

                  <g className="gulf-pin gulf-pin--anchor" data-city="sharjah">
                    <circle className="gulf-pin__ring" cx="588" cy="225" r="26" />
                    <circle className="gulf-pin__halo" cx="588" cy="225" r="16" />
                    <circle className="gulf-pin__dot" cx="588" cy="225" r="6" />
                    <line x1="588" y1="220" x2="588" y2="155" stroke="rgba(200,16,46,0.5)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="588" y="146" fontFamily="Geist Mono, monospace" fontSize="12" fill="#C8102E" fontWeight="600" textAnchor="middle">SHARJAH</text>
                    <text x="588" y="134" fontFamily="Geist Mono, monospace" fontSize="8" fill="rgba(200,16,46,0.7)" textAnchor="middle">01 / HEAD OFFICE</text>
                  </g>
                </svg>
                <div className="map-frame__legend">
                  <span className="mono">— REGION · UAE &amp; QATAR</span>
                  <span className="mono">3 OFFICES · 2 COUNTRIES</span>
                </div>
              </div>
              <div className="pin-list">
                <div className="pin" data-city-card="sharjah">
                  <span className="pin-num">01 / HQ</span>
                  <div><h4>Sharjah, UAE</h4><p>25.348°N · 55.420°E</p></div>
                </div>
                <div className="pin" data-city-card="abu-dhabi">
                  <span className="pin-num">02 / BRANCH</span>
                  <div><h4>Abu Dhabi, UAE</h4><p>24.453°N · 54.377°E</p></div>
                </div>
                <div className="pin" data-city-card="doha">
                  <span className="pin-num">03 / BRANCH</span>
                  <div><h4>Doha, Qatar</h4><p>25.286°N · 51.530°E</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* STRENGTHS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Why us</span>
                <h2 className="h-1">What sets us <em>apart</em>.</h2>
              </div>
              <p className="section-head__sub">The reasons our clients renew, year after year.</p>
            </div>
            <div className="strengths-grid" data-reveal>
              <div className="strength"><span className="strength__num">— 01</span><h3 className="strength__title">Authorized distribution</h3><p className="strength__desc">Direct partnerships, full warranty, no parallel imports.</p></div>
              <div className="strength"><span className="strength__num">— 02</span><h3 className="strength__title">Application support</h3><p className="strength__desc">Specialists with petroleum, refinery and materials backgrounds.</p></div>
              <div className="strength"><span className="strength__num">— 03</span><h3 className="strength__title">On-ground service</h3><p className="strength__desc">UAE, Qatar, Abu Dhabi response within working day.</p></div>
              <div className="strength"><span className="strength__num">— 04</span><h3 className="strength__title">Standards-first</h3><p className="strength__desc">Every quote referenced to ASTM, ISO or IP method.</p></div>
              <div className="strength"><span className="strength__num">— 05</span><h3 className="strength__title">Calibration &amp; consumables</h3><p className="strength__desc">Reference materials and spares throughout instrument lifecycle.</p></div>
              <div className="strength"><span className="strength__num">— 06</span><h3 className="strength__title">ISO 9001 &amp; 14001</h3><p className="strength__desc">Audited management systems your auditors expect.</p></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section section--tight cta-band">
          <div className="container cta-band__inner" data-reveal>
            <span className="eyebrow">Talk to us</span>
            <h2 className="h-1">Looking for a specific <em>instrument?</em></h2>
            <div className="actions">
              <a className="btn btn--primary" href="/products">Browse the catalog <span className="arrow">→</span></a>
              <a className="btn btn--ghost" href="/contact">Contact our team</a>
            </div>
          </div>
        </section>

      </main>

      <AboutMapSync />
    </>
  )
}
