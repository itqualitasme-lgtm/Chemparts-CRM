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
          How Chemparts Middle East FZC handles your information.
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">1. What we collect</h2>
            <p>
              Account and company details (name, company, official email, phone, country),
              delivery/billing addresses, and records of your enquiries, quotations and orders.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">2. How we use it</h2>
            <p>
              To operate your account, prepare quotations, process and deliver orders, provide
              service and support, and send transactional messages (verification, order and status
              updates). We do not sell your data.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">3. Storage &amp; security</h2>
            <p>
              Data is stored on managed cloud infrastructure with access controls. Passwords are
              handled by our authentication provider and are never stored in plain text.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">4. Sharing</h2>
            <p>
              We share information only as needed to fulfil your orders (e.g. logistics partners) or
              where required by law. Manufacturer partners may be involved for warranty and service.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">5. Your rights &amp; contact</h2>
            <p>
              You may request access to or correction of your data. Contact{' '}
              <a className="text-[#0E7490] underline" href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>.
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
