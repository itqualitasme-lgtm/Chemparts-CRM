import { getFaqs } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'FAQ - Chemparts Middle East',
  description: 'Answers to common questions about Chemparts — analytical instruments, spares, consumables, quotes, service and delivery across the UAE, Qatar and the Gulf.',
}

export default async function FaqPage() {
  const faqs = await getFaqs()

  // FAQPage structured data for rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <p className="breadcrumb"><a href="/">[HOME]</a><span className="sep">/</span>FAQ</p>
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Questions &amp; answers</span>
              <h1 className="h-1">Frequently asked <em>questions</em>.</h1>
            </div>
            <p className="section-head__sub">Instruments, spares, consumables, quotes and service across the Gulf. Can’t find it? <a href="/contact#form" style={{ color: 'var(--crimson)' }}>Ask our team</a>.</p>
          </div>

          <div style={{ marginTop: 24 }}>
            {faqs.map((f, i) => (
              <details key={i} className="faq-item" open={i === 0}>
                <summary>{f.q}</summary>
                <div className="faq-item__a">{f.a}</div>
              </details>
            ))}
          </div>

          <div className="cta-band__inner" style={{ marginTop: 40, textAlign: 'center' }}>
            <a className="btn btn--primary" href="/contact#form">Still have a question? Contact us</a>
          </div>
        </div>
      </section>
    </main>
  )
}
