import ContactSuccessBanner from './ContactSuccessBanner'
import ContactForm from './ContactForm'
import { getSessionUser } from '@/lib/auth/session'
import { getContactInfo } from '@/lib/site-settings'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const user = await getSessionUser()
  const contact = await getContactInfo()
  let company = ''
  if (user?.customerId) {
    const c = await db.customer.findUnique({ where: { id: user.customerId }, select: { companyName: true } })
    company = c?.companyName ?? ''
  }
  return (
    <>
      <div id="success-banner" hidden>
        <div className="container" style={{ paddingTop: 24 }}>
          <div style={{ border: '1px solid var(--rule)', padding: '16px 20px', background: '#F0FDF4', borderColor: '#86EFAC', fontSize: 14, color: '#065F46' }}>
            <strong>Message sent.</strong> Our team will reply within the working day. Thanks for reaching out.
          </div>
        </div>
      </div>

      <main id="main">

        <section className="section">
          <div className="container">
            <div className="coord">
              <span>005 / CONTACT</span>
              <span>3 OFFICES</span>
              <span>UAE · QATAR · GULF</span>
            </div>
            <div className="about-hero about-hero--wide about-hero--flipped" data-reveal>
              <div className="about-hero__copy">
                <span className="eyebrow">Get in touch · Chemparts</span>
                <h1 className="h-display">Let&apos;s talk <em>instruments</em>.</h1>
                <p className="body-lg">Tell us your standard, sample type or budget. The Chemparts team usually replies within the working day. WhatsApp is fastest.</p>
              </div>
              <figure className="about-hero__photo">
                <img src="/assets/images/photos/office-team.jpg" alt="The Chemparts team — Sharjah head office" loading="lazy" decoding="async" />
                <figcaption><span className="mono">— REPLY WITHIN WORKING DAY</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Offices */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Offices</span>
                <h2 className="h-2">UAE &amp; Qatar offices, full <em>Gulf</em> coverage.</h2>
              </div>
            </div>

            <div className="offices-grid" data-reveal>
              <div className="office">
                <span className="office__head">— 01 / HEAD OFFICE</span>
                <h3>Sharjah, UAE</h3>
                <address>A2-96, SAIF Zone<br />P.O. Box 9681<br />Sharjah, UAE</address>
                <span className="office__phone">+971 6 5574047</span>
                <a className="office__link" href="https://maps.google.com/?q=SAIF+Zone+Sharjah+A2-96" target="_blank" rel="noopener">Get directions →</a>
              </div>
              <div className="office office--feature">
                <span className="office__head">— 02 / BRANCH · ICV CERTIFIED</span>
                <h3>Abu Dhabi, UAE</h3>
                <address>Chemparts Medical &amp; Laboratory Supplies LLC<br />P.O. Box 9029<br />Abu Dhabi, UAE</address>
                <p className="office__note">Approved for ADNOC group procurement under the Abu Dhabi In-Country Value (ICV) program.</p>
                <span className="office__phone">02-5527185</span>
                <a className="office__link" href="https://maps.google.com/?q=Abu+Dhabi" target="_blank" rel="noopener">Get directions →</a>
              </div>
              <div className="office">
                <span className="office__head">— 03 / BRANCH</span>
                <h3>Doha, Qatar</h3>
                <address>Office 15, Building 12, Ground floor<br />New Souq Al Haraj<br />Doha, Qatar</address>
                <span className="office__phone">Contact via WhatsApp</span>
                <a className="office__link" href="https://maps.google.com/?q=New+Souq+Al+Haraj+Doha" target="_blank" rel="noopener">Get directions →</a>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Departments */}
        <section className="section section--slate">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Departments</span>
                <h2 className="h-2">Reach the <em>right</em> team faster.</h2>
              </div>
              <p className="section-head__sub">Skip the switchboard — write directly to the team that handles your enquiry.</p>
            </div>

            <div className="dept-grid" data-reveal data-stagger>
              <div className="dept-card">
                <span className="dept-card__num">— 01 / Sales</span>
                <h3>Sales &amp; quotations</h3>
                <p className="dept-card__desc">New instrument quotes, configuration help, brand selection, regional pricing.</p>
                <div className="dept-card__contact">
                  <a href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>
                  <a href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp +971 55 756 6123</a>
                </div>
              </div>
              <div className="dept-card">
                <span className="dept-card__num">— 02 / Service</span>
                <h3>Service &amp; calibration</h3>
                <p className="dept-card__desc">Installation, preventive maintenance, AMC, IQ/OQ/PQ documentation, emergency repairs.</p>
                <div className="dept-card__contact">
                  <a href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>
                  <a href="tel:+97165574047">+971 6 5574047</a>
                </div>
              </div>
              <div className="dept-card">
                <span className="dept-card__num">— 03 / Application</span>
                <h3>Application support</h3>
                <p className="dept-card__desc">Method selection, sample-suitability assessment, calibration plans, ASTM/ISO/IP shortlists.</p>
                <div className="dept-card__contact">
                  <a href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>
                  <a href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp our specialists</a>
                </div>
              </div>
              <div className="dept-card">
                <span className="dept-card__num">— 04 / Parts</span>
                <h3>Spares &amp; consumables</h3>
                <p className="dept-card__desc">OEM spare parts, reference materials, calibration standards, lab consumables — held in regional stock.</p>
                <div className="dept-card__contact">
                  <a href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>
                  <a href="tel:+97165574047">+971 6 5574047 ext. 2</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* Contact form */}
        <section className="section">
          <div className="container contact-grid">
            <div data-reveal>
              <span className="eyebrow">Contact form</span>
              <h2 className="h-2" style={{ marginTop: 16 }}>Send us a <em>note</em>.</h2>
              <p className="body-lg" style={{ marginTop: 16 }}>Form submissions land in our shared inbox. For urgent quotes, WhatsApp is faster:</p>
              <a className="btn btn--whatsapp" style={{ marginTop: 16 }} href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener">WhatsApp {contact.whatsappDisplay}</a>
              <hr className="rule" style={{ margin: '32px 0' }} />
              <div className="stat-strip">
                <div><div className="lbl">Phone</div><div className="val">{contact.phone}</div></div>
                <div><div className="lbl">Email</div><div className="val">{contact.email}</div></div>
                <div><div className="lbl">Hours</div><div className="val">{contact.hours}</div></div>
              </div>
            </div>

            {/* Submits to a server action that logs a staff-portal enquiry. */}
            <ContactForm defaultName={user?.fullName ?? ''} defaultCompany={company} defaultEmail={user?.email ?? ''} />
          </div>
        </section>

        <hr className="rule" />

        {/* Map embed */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Find us</span>
                <h2 className="h-2">SAIF Zone, <em>Sharjah</em>.</h2>
              </div>
              <p className="section-head__sub">Head office. Walk-ins by appointment.</p>
            </div>
            <div style={{ border: '1px solid var(--rule)', aspectRatio: '21/9', overflow: 'hidden', background: 'var(--bg-2)' }}>
              <iframe src="https://maps.google.com/maps?q=SAIF+Zone+Sharjah&z=13&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ width: '100%', height: '100%', border: 0 }} title="Chemparts SAIF Zone office on Google Maps"></iframe>
            </div>
            <p className="mono text-muted" style={{ fontSize: 12, marginTop: 12 }}>
              Map not loading?{' '}
              <a href="https://maps.google.com/?q=SAIF+Zone+Sharjah+A2-96" target="_blank" rel="noopener" style={{ color: 'var(--crimson)', textDecoration: 'underline' }}>
                Open in Google Maps ↗
              </a>
            </p>
          </div>
        </section>

      </main>

      <ContactSuccessBanner />
    </>
  )
}
