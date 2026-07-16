import { getSessionUser } from '@/lib/auth/session'
import BookServiceForm from './BookServiceForm'

export const dynamic = 'force-dynamic'

export default async function BookServicePage() {
  const user = await getSessionUser()

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="breadcrumb">
            <a href="/">[HOME]</a>
            <span className="sep">/</span>
            BOOK A SERVICE
          </p>

          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Service &amp; support</span>
              <h1 className="h-1">Book a <em>service</em>.</h1>
            </div>
            <p className="section-head__sub">
              AMC, calibration, repair, installation or a planning consultation — tell us the equipment and what you
              need. Our factory-trained engineers cover the Gulf and export service worldwide.
            </p>
          </div>

          <div className="stat-strip" style={{ marginTop: 32 }}>
            <div><div className="lbl">Coverage</div><div className="val">Gulf + worldwide</div></div>
            <div><div className="lbl">Engineers</div><div className="val">Factory-trained</div></div>
            <div><div className="lbl">Calibration</div><div className="val">ISO · traceable</div></div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* What we cover */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">What we cover</span>
              <h2 className="h-2">Service across the <em>instrument lifecycle</em>.</h2>
            </div>
            <p className="section-head__sub">
              From installation to annual maintenance — keeping your lab compliant, calibrated and running.
            </p>
          </div>

          <div className="dept-grid" data-reveal data-stagger>
            <div className="dept-card">
              <span className="dept-card__num">— 01 / AMC</span>
              <h3>Annual Maintenance Contracts</h3>
              <p className="dept-card__desc">Scheduled preventive maintenance, priority response and discounted spares under a yearly contract that keeps uptime high and budgets predictable.</p>
            </div>
            <div className="dept-card">
              <span className="dept-card__num">— 02 / Calibration</span>
              <h3>Calibration &amp; verification</h3>
              <p className="dept-card__desc">Traceable calibration against ASTM/ISO/IP methods, with certificates and adjustment where needed — on-site or at our facility.</p>
            </div>
            <div className="dept-card">
              <span className="dept-card__num">— 03 / Repair</span>
              <h3>Repair &amp; diagnostics</h3>
              <p className="dept-card__desc">Fault diagnosis and repair with genuine OEM spare parts held in regional stock to cut downtime.</p>
            </div>
            <div className="dept-card">
              <span className="dept-card__num">— 04 / Installation</span>
              <h3>Installation &amp; commissioning</h3>
              <p className="dept-card__desc">Site readiness, installation, commissioning and IQ/OQ/PQ documentation so the instrument is validated from day one.</p>
            </div>
            <div className="dept-card">
              <span className="dept-card__num">— 05 / Consultation</span>
              <h3>Planning &amp; consultation</h3>
              <p className="dept-card__desc">Method selection, lab layout, calibration schedules and compliance planning — before you buy or expand.</p>
            </div>
            <div className="dept-card">
              <span className="dept-card__num">— 06 / Training</span>
              <h3>Operator training</h3>
              <p className="dept-card__desc">Hands-on training for your analysts on operation, routine maintenance and first-line troubleshooting.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* How it works */}
      <section className="section section--slate">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">How it works</span>
              <h2 className="h-2">From request to <em>report</em>.</h2>
            </div>
            <p className="section-head__sub">A simple, documented path — usually acknowledged the same working day.</p>
          </div>

          <ol className="process" data-reveal data-stagger>
            <li className="process__step">
              <span className="process__num">01</span>
              <span className="process__title">Tell us the equipment</span>
              <p className="process__desc">Book a service below — pick the type, name the instrument and describe what you need.</p>
            </li>
            <li className="process__step">
              <span className="process__num">02</span>
              <span className="process__title">We schedule</span>
              <p className="process__desc">We confirm scope, timing and any parts, then book an engineer — on-site or remote.</p>
            </li>
            <li className="process__step">
              <span className="process__num">03</span>
              <span className="process__title">Service performed</span>
              <p className="process__desc">Calibration, repair, installation or maintenance by factory-trained engineers.</p>
            </li>
            <li className="process__step">
              <span className="process__num">04</span>
              <span className="process__title">Report &amp; certificate</span>
              <p className="process__desc">You receive the service report and, where applicable, a traceable calibration certificate.</p>
            </li>
            <li className="process__step">
              <span className="process__num">05</span>
              <span className="process__title">Ongoing cover</span>
              <p className="process__desc">Roll into an AMC for scheduled upkeep, priority response and spares.</p>
            </li>
          </ol>
        </div>
      </section>

      <hr className="rule" />

      {/* Booking form */}
      <section className="section" id="book">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Request service</span>
              <h2 className="h-2">Book a <em>service</em> visit.</h2>
            </div>
            <p className="section-head__sub">
              Tell us the equipment and what you need — we&apos;ll reply, usually within the working day. For urgent
              breakdowns, WhatsApp <a href="https://wa.me/971557566123" target="_blank" rel="noopener">+971 55 756 6123</a>.
            </p>
          </div>
          <div style={{ maxWidth: 720, marginTop: 8 }}>
            <BookServiceForm loggedIn={user != null} />
          </div>
        </div>
      </section>
    </main>
  )
}
