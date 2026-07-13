import Script from 'next/script'
import { getPublicCatalog } from '@/lib/catalog-data'
import { getSessionUser } from '@/lib/auth/session'
import { db } from '@/lib/db'

export default async function SiteChrome({ extraScripts = [] }: { extraScripts?: string[] }) {
  const catalog = await getPublicCatalog()

  // Prefill the quote/price modal for signed-in users.
  const user = await getSessionUser()
  let prefillCompany = ''
  let prefillPhone = ''
  if (user?.customerId) {
    const c = await db.customer.findUnique({ where: { id: user.customerId }, select: { companyName: true, phone: true } })
    prefillCompany = c?.companyName ?? ''
    prefillPhone = c?.phone ?? ''
  }
  const prefillName = user?.fullName ?? ''
  const prefillEmail = user?.email ?? ''
  // Inline the live catalog so it exists before the afterInteractive scripts run.
  // Replaces the frozen static /assets/js/products.js — this is what makes staff
  // product/brand edits show up on the website.
  const catalogScript = (
    `window.PRODUCTS=${JSON.stringify(catalog.products)};` +
    `window.BRANDS=${JSON.stringify(catalog.brands)};` +
    `window.BRAND_LOGOS=${JSON.stringify(catalog.brandLogos)};` +
    `window.INDUSTRIES=${JSON.stringify(catalog.industries)};` +
    `window.TEST_TYPES=${JSON.stringify(catalog.testTypes)};` +
    `window.CATEGORIES=${JSON.stringify(catalog.categories)};`
  ).replace(/</g, '\\u003c')
  return (
    <>
      {/* precedence makes React 19 hoist this to <head> and treat it as a
          render-blocking stylesheet — without it the browser paints raw HTML
          first (a flash of unstyled content) before the CSS applies. */}
      <link rel="stylesheet" href="/assets/css/styles.css" precedence="high" />

      {/* Quote modal */}
      <div className="modal-backdrop" data-open="false">
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="quote-title" data-quote-modal>
          <div className="modal__head">
            <span className="eyebrow">Request a quote</span>
            <button type="button" className="modal__close" data-modal-close aria-label="Close dialog">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.25" /></svg>
            </button>
          </div>
          <form className="modal__body" data-quote-form>
            <h3 id="quote-title">Tell us what you need</h3>
            <p className="lede">Send us your requirement and our team will reply by email — usually within the working day. Or email <a href="mailto:info@chemparts-me.com" style={{ color: 'var(--crimson)' }}>info@chemparts-me.com</a>.</p>
            <div className="field"><label htmlFor="qf-name">Name</label><input id="qf-name" name="name" type="text" required defaultValue={prefillName} /></div>
            <div className="field"><label htmlFor="qf-company">Company</label><input id="qf-company" name="company" type="text" required defaultValue={prefillCompany} /></div>
            <div className="field"><label htmlFor="qf-email">Email</label><input id="qf-email" name="email" type="email" required defaultValue={prefillEmail} /></div>
            <div className="field"><label htmlFor="qf-phone">Phone</label><input id="qf-phone" name="phone" type="tel" required placeholder="+971 50 000 0000" defaultValue={prefillPhone} /></div>
            <div className="field"><label htmlFor="qf-instrument">Product / part</label><input id="qf-instrument" name="instrument" type="text" placeholder="Instrument, spare part or consumable — e.g. LAB-X5000, XRF sample cups" /></div>
            <div className="field"><label htmlFor="qf-message">Message</label><textarea id="qf-message" name="message" rows={3} placeholder="Standards, sample type, throughput..."></textarea></div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

            <div className="actions">
              <button type="submit" className="btn btn--accent">Send request <span className="arrow">→</span></button>
              <button type="button" className="btn btn--ghost" data-modal-close>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mobile-bar" role="region" aria-label="Quick actions">
        <button type="button" className="btn btn--accent" data-quote="">Get a quote <span className="arrow">&rarr;</span></button>
        <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp</a>
      </div>

      {/* Live catalog data from the database (was: static /assets/js/products.js) */}
      <script dangerouslySetInnerHTML={{ __html: catalogScript }} />
      <Script src="/assets/js/app.js" strategy="afterInteractive" />
      {extraScripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </>
  )
}
