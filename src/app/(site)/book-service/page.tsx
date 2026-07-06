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
        </div>
      </section>

      <hr className="rule" />

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <BookServiceForm loggedIn={user != null} />
        </div>
      </section>
    </main>
  )
}
