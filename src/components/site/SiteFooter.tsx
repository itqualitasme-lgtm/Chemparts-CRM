export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cta">
        <h2>Need analytical <em>instruments?</em><br />Or service for one you already have?</h2>
        <div className="site-footer__cta-actions">
          <a className="btn btn--whatsapp" href="https://wa.me/971557566123" target="_blank" rel="noopener">WhatsApp our team <span className="arrow">→</span></a>
          <a className="btn btn--ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} href="mailto:info@chemparts-me.com">Email info@chemparts-me.com</a>
        </div>
      </div>

      <div className="site-footer__cols">
        <div>
          <h4>Chemparts ME</h4>
          <p>Two decades supplying analytical instruments, OEM spare parts, lab consumables and turnkey lab solutions across the Middle East. Authorized partner for Hitachi, Tanaka, Oxford and 14 more leading brands.</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: '#6B7588', textTransform: 'uppercase', marginTop: 16 }}>[ ISO 9001 · ISO 14001 ]</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/application">Application</a></li>
            <li><a href="/partners">Partners</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Head Office</h4>
          <address>A2-96, SAIF Zone<br />P.O. Box 9681<br />Sharjah, UAE</address>
          <p style={{ fontFamily: 'var(--font-mono)', marginTop: 12 }}>+971 6 5574047</p>
        </div>
        <div>
          <h4>Branches</h4>
          <address style={{ marginBottom: 16 }}>Abu Dhabi, UAE<br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>02-5527185</span></address>
          <address>Doha, Qatar<br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>New Souq Al Haraj</span></address>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© <span data-year>2026</span> CHEMPARTS MIDDLE EAST FZC · CHEMPARTS MEDICAL &amp; LABORATORY SUPPLIES LLC</span>
        <span>[ BUILT ON STANDARDS · ISO 9001 · 14001 ]</span>
      </div>
    </footer>
  )
}
