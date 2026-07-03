import Script from 'next/script'

export default function SiteChrome({ extraScripts = [] }: { extraScripts?: string[] }) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/styles.css" />

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
            <p className="lede">Submit and we&apos;ll open WhatsApp pre-filled with your details. Or email <a href="mailto:info@chemparts-me.com" style={{ color: 'var(--crimson)' }}>info@chemparts-me.com</a>.</p>
            <div className="field"><label htmlFor="qf-name">Name</label><input id="qf-name" name="name" type="text" required /></div>
            <div className="field"><label htmlFor="qf-company">Company</label><input id="qf-company" name="company" type="text" required /></div>
            <div className="field"><label htmlFor="qf-email">Email</label><input id="qf-email" name="email" type="email" required /></div>
            <div className="field"><label htmlFor="qf-instrument">Instrument</label><input id="qf-instrument" name="instrument" type="text" placeholder="e.g. LAB-X5000" /></div>
            <div className="field"><label htmlFor="qf-message">Message</label><textarea id="qf-message" name="message" rows={3} placeholder="Standards, sample type, throughput..."></textarea></div>
            <div className="actions">
              <button type="submit" className="btn btn--accent">Open in WhatsApp <span className="arrow">→</span></button>
              <button type="button" className="btn btn--ghost" data-modal-close>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mobile-bar" role="region" aria-label="Quick actions">
        <button type="button" className="btn btn--accent" data-quote="">Get a quote <span className="arrow">&rarr;</span></button>
        <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp</a>
      </div>

      <Script src="/assets/js/products.js" strategy="afterInteractive" />
      <Script src="/assets/js/app.js" strategy="afterInteractive" />
      {extraScripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </>
  )
}
