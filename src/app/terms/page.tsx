import Link from 'next/link'

export const metadata = { title: 'Terms & Conditions - Chemparts' }

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
          These terms govern your use of the Chemparts Middle East FZC website and customer portal,
          and any quotations, orders and services you request from us. Final wording is subject to
          confirmation by Chemparts.
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">1. Your account</h2>
            <p>
              Our store and customer portal are intended for business customers. When you register,
              you agree to provide accurate company and contact details and to use an official
              company email address. You are responsible for keeping your login details secure and
              for any activity carried out under your account. Please notify us promptly of any
              unauthorised use.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">2. Products &amp; information</h2>
            <p>
              Product descriptions, specifications, images and availability are provided for guidance
              and may be updated at any time. Where a specification is critical to your application,
              please confirm suitability with our team before ordering. Instruments and specialised
              items are typically supplied on a quotation basis.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">3. Quotations</h2>
            <p>
              Quotations are valid for the period stated on them and are subject to stock, lead time
              and final price confirmation. A quotation is an invitation to order, not a binding
              contract, until we accept your order.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">4. Orders, pricing &amp; payment</h2>
            <p>
              Placing an order (including against a purchase order) confirms your acceptance of the
              applicable quotation and these terms. Prices are in the currency stated and are
              exclusive of VAT unless indicated; UAE VAT is applied where applicable. Payment terms
              (for example, payment against purchase order or on agreed account terms) are as stated
              on your quotation or invoice.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">5. Delivery</h2>
            <p>
              Delivery timescales are estimates and are not guaranteed. Risk in the goods passes to
              you on delivery to the address you provide. You are responsible for supplying accurate
              delivery and contact details and for ensuring someone is available to receive the
              goods.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">6. Warranty, service &amp; AMC</h2>
            <p>
              Instruments carry the manufacturer&apos;s warranty as specified for each product.
              Installation, calibration, repair and Annual Maintenance Contracts (AMC) are provided
              under separate agreement. Consumables and spare parts are warranted against
              manufacturing defects only.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">7. Returns &amp; cancellations</h2>
            <p>
              As a specialist supplier, some items (including custom, hazardous, or made-to-order
              products) may not be returnable. Please contact us before returning any item;
              approved returns must be unused and in original packaging. Cancellation of confirmed
              orders may be subject to charges.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">8. Liability</h2>
            <p>
              To the extent permitted by law, our liability in connection with any product or
              service is limited to the value of the goods or services supplied. Nothing in these
              terms excludes any liability that cannot be excluded by law.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">9. Governing law</h2>
            <p>
              These terms are governed by the laws of the United Arab Emirates, and any dispute is
              subject to the jurisdiction of the UAE courts.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold text-slate-900">10. Contact</h2>
            <p>
              Questions about these terms:{' '}
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
