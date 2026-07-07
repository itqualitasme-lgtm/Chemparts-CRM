import { db } from '@/lib/db'
import { confirmUnsubscribe } from '../newsletter-actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Unsubscribe — Chemparts' }

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const sub = token
    ? await db.subscriber.findUnique({ where: { unsubscribeToken: token }, select: { email: true, active: true } })
    : null

  async function doUnsub() {
    'use server'
    if (token) await confirmUnsubscribe(token)
  }

  return (
    <main id="main">
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <span className="eyebrow">Email preferences</span>
          {!sub ? (
            <>
              <h1 className="h-2" style={{ marginTop: 16 }}>Link not recognized.</h1>
              <p className="body-lg" style={{ marginTop: 12 }}>This unsubscribe link is invalid or has expired. Email <a href="mailto:info@chemparts-me.com" style={{ color: 'var(--crimson)' }}>info@chemparts-me.com</a> and we'll remove you.</p>
            </>
          ) : !sub.active ? (
            <>
              <h1 className="h-2" style={{ marginTop: 16 }}>You're unsubscribed.</h1>
              <p className="body-lg" style={{ marginTop: 12 }}><strong>{sub.email}</strong> will no longer receive marketing emails from Chemparts.</p>
            </>
          ) : (
            <>
              <h1 className="h-2" style={{ marginTop: 16 }}>Unsubscribe <em>{sub.email}</em>?</h1>
              <p className="body-lg" style={{ marginTop: 12 }}>You'll stop receiving Chemparts promotions and offers. You can re-subscribe anytime from our website.</p>
              <form action={doUnsub} style={{ marginTop: 20 }}>
                <button type="submit" className="btn btn--accent">Confirm unsubscribe <span className="arrow">→</span></button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
