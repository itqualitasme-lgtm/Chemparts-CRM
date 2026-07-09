import { confirmNewsletter } from '../../newsletter-actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Confirm subscription — Chemparts' }

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const res = token ? await confirmNewsletter(token) : {}

  return (
    <main id="main">
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <span className="eyebrow">Email preferences</span>
          {res.ok ? (
            <>
              <h1 className="h-2" style={{ marginTop: 16 }}>You&rsquo;re subscribed &mdash; thank you!</h1>
              <p className="body-lg" style={{ marginTop: 12 }}>
                <strong>{res.email}</strong> will now receive Chemparts product news, promotions and offers. You can unsubscribe anytime from the link in any email.
              </p>
            </>
          ) : (
            <>
              <h1 className="h-2" style={{ marginTop: 16 }}>Link not recognized.</h1>
              <p className="body-lg" style={{ marginTop: 12 }}>
                This confirmation link is invalid or has already been used. Sign up again from our website, or email <a href="mailto:info@chemparts-me.com" style={{ color: 'var(--crimson)' }}>info@chemparts-me.com</a>.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
