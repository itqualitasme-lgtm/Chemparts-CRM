import NewsletterSignup from './NewsletterSignup'
import { getContactInfo } from '@/lib/site-settings'

export default async function SiteFooter() {
  const contact = await getContactInfo()
  const wa = `https://wa.me/${contact.whatsapp}`
  return (
    <footer className="site-footer">
      <div className="site-footer__cta">
        <h2>Need analytical <em>instruments?</em><br />Or service for one you already have?</h2>
        <div className="site-footer__cta-actions">
          <a className="btn btn--whatsapp" href={wa} target="_blank" rel="noopener">WhatsApp our team</a>
          <a className="btn btn--ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} href="/book-service">Book a service</a>
        </div>
      </div>

      <div className="site-footer__cols">
        <div>
          <h4>Chemparts</h4>
          <p>Two decades supplying analytical instruments, OEM spare parts, lab consumables and turnkey lab solutions to laboratories worldwide. Authorized partner for Hitachi, Tanaka, Oxford and 14 more leading brands.</p>
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
            <li><a href="/blog">News</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Updates &amp; offers</h4>
          <p>Product news, promotions and offers on instruments, spares and consumables — straight to your inbox. No spam.</p>
          <NewsletterSignup />
        </div>
        <div>
          <h4>Get in touch</h4>
          <ul>
            <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><a href={wa} target="_blank" rel="noopener">WhatsApp our team</a></li>
            <li><a href="/book-service">Book a service</a></li>
            <li><a href="/contact#form" data-quote="">Request a quote</a></li>
          </ul>
          <p style={{ fontFamily: 'var(--font-mono)', marginTop: 12 }}>{contact.phone}</p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© <span data-year>2026</span> CHEMPARTS MIDDLE EAST FZC · CHEMPARTS MEDICAL &amp; LABORATORY SUPPLIES LLC</span>
        <span>[ BUILT ON STANDARDS · ISO 9001 · 14001 ]</span>
      </div>
    </footer>
  )
}
