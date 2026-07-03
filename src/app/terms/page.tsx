import Link from 'next/link'

export const metadata = { title: 'Terms & Conditions — Chemparts' }

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <img src="/images/logo.svg" alt="Chemparts" width={44} height={24} />
          <span className="text-xs font-bold tracking-[0.2em] text-[#0A2540]">CHEMPARTS</span>
        </Link>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Terms &amp; Conditions</h1>
        <p className="mb-8 text-sm text-slate-500">
          Chemparts Middle East FZC. Please review these terms; final wording is subject to
          confirmation by Chemparts.
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">1. Accounts</h2>
            <p>
              Accounts are for business use and must be registered with an official company email.
              You are responsible for keeping your credentials secure and for activity under your
              account. Staff, vendor and administrator accounts are created by Chemparts.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">2. Quotations &amp; orders</h2>
            <p>
              Quotations are valid for the period stated and are subject to stock, lead time and
              price confirmation. Placing an order (including against a purchase order) constitutes
              acceptance of the applicable quotation and these terms. Prices are exclusive of VAT
              unless stated; UAE VAT is applied where applicable.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">3. Delivery</h2>
            <p>
              Delivery timescales are estimates. Risk passes on delivery to the address you provide.
              You are responsible for providing accurate delivery and contact details.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">4. Warranty &amp; service</h2>
            <p>
              Instruments carry the manufacturer&apos;s warranty as specified per product. Annual
              maintenance contracts (AMC), calibration and service are provided under separate
              agreement.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">5. Liability</h2>
            <p>
              To the extent permitted by law, Chemparts&apos; liability is limited to the value of
              the goods or services supplied. Nothing in these terms excludes liability that cannot
              be excluded by law.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">6. Contact</h2>
            <p>
              Questions about these terms: <a className="text-[#0E7490] underline" href="mailto:info@chemparts-me.com">info@chemparts-me.com</a>.
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
