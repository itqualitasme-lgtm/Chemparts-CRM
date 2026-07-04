import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Chemparts' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <img src="/images/logo.svg" alt="Chemparts" width={44} height={24} />
          <span className="text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</span>
        </Link>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-500">
          This policy explains how Chemparts Middle East FZC handles the information of customers who
          use our website and customer portal.
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">1. Information we collect</h2>
            <p>
              When you register and use your account, we collect your name, company, official email,
              phone number and country, your delivery and billing addresses, and records of your
              enquiries, quotations and orders. We also collect basic technical information (such as
              your browser and usage of the site) to keep the service working.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">2. How we use your information</h2>
            <p>
              We use your information to operate your account, prepare quotations, process and
              deliver your orders, provide service and support, and send transactional messages such
              as email verification, one-time sign-in codes, and order and status updates. We do not
              sell your information.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">3. Storage &amp; security</h2>
            <p>
              Your data is held on managed cloud infrastructure with access controls. Passwords and
              sign-in codes are handled by our authentication provider and are never stored in plain
              text. We take reasonable measures to protect your information.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">4. Sharing</h2>
            <p>
              We share your information only where needed to serve you — for example with logistics
              partners to deliver your order, or with manufacturer partners for warranty, service or
              technical support — and where required by law. We do not share your information for
              third-party marketing.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">5. Retention</h2>
            <p>
              We keep your account and transaction records for as long as your account is active and
              as needed to meet legal, tax and warranty obligations.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">6. Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information,
              subject to records we are required to keep. To make a request, contact us using the
              details below.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">7. Contact</h2>
            <p>
              For any privacy question or request:{' '}
              <a className="text-[#0E7490] underline" href="mailto:info@chemparts-me.com">
                info@chemparts-me.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          This is a starting template and should be reviewed and finalised by Chemparts before
          public launch.
        </p>
        <Link href="/register" className="mt-6 inline-block text-sm font-medium text-[#0E7490] underline">
          ← Back to registration
        </Link>
      </div>
    </main>
  )
}
