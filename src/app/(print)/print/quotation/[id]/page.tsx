import { notFound } from 'next/navigation'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'
import { productImageUrl } from '@/lib/product-image'
import PrintButton from './PrintButton'

export const metadata = { title: 'Quotation', robots: { index: false } }
export const dynamic = 'force-dynamic'

// Chemparts company details for the letterhead / footer.
const COMPANY = {
  name: 'Chemparts Middle East FZC',
  legal: 'Chemparts Medical & Laboratory Supplies LLC',
  tagline: 'Analytical instruments · OEM spare parts · lab consumables · service & AMC',
  phone: '+971 6 5574047',
  email: 'info@chemparts-me.com',
  web: 'chemparts-me.com',
}

const TERMS = [
  'Prices are quoted in the currency shown and are exclusive of any bank charges.',
  'This quotation is valid until the date indicated; prices are subject to reconfirmation thereafter.',
  'Delivery period begins on receipt of a confirmed purchase order and applicable advance payment.',
  'Warranty is as per the manufacturer’s standard terms for each item.',
  'Goods remain the property of Chemparts until paid in full.',
  'Installation, calibration and training are quoted separately unless stated in the line items.',
]

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function QuotationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params

  const q = await db.quotation.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          companyName: true,
          address: true,
          city: true,
          country: true,
          trn: true,
          phone: true,
          email: true,
          contacts: { where: { isPrimary: true }, take: 1, select: { name: true, designation: true, email: true, phone: true } },
        },
      },
      items: {
        orderBy: { sortOrder: 'asc' },
        include: {
          product: { select: { image: true, productType: true, sample: true, output: true, standards: true, modelNo: true } },
        },
      },
    },
  })
  if (!q) notFound()

  const t = quoteTotals(
    q.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice), discountPct: Number(i.discountPct) })),
    Number(q.vatPercent),
    { shipping: Number(q.shipping), other: Number(q.otherCharges) },
  )
  const m = (n: number) => `${q.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const contact = q.customer?.contacts[0]

  return (
    <>
      <PrintButton />

      <div className="mx-auto my-0 max-w-[820px] bg-white p-10 text-[13px] leading-relaxed text-slate-800 shadow-lg print:my-0 print:max-w-none print:p-0 print:shadow-none">
        {/* Letterhead */}
        <header className="flex items-start justify-between border-b-2 border-[#0A2540] pb-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/logo.svg" alt="Chemparts" width={72} height={36} />
            <div>
              <div className="text-lg font-bold tracking-tight text-[#0A2540]">{COMPANY.name}</div>
              <div className="text-[11px] text-slate-500">{COMPANY.tagline}</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <div>{COMPANY.phone}</div>
            <div>{COMPANY.email}</div>
            <div>{COMPANY.web}</div>
          </div>
        </header>

        {/* Title + meta */}
        <div className="mt-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A2540]">QUOTATION</h1>
            <div className="mt-1 font-mono text-sm text-slate-700">{q.quotationNo}</div>
          </div>
          <table className="text-[12px] text-slate-600">
            <tbody>
              <tr><td className="pr-3 text-slate-400">Date</td><td className="font-medium">{fmtDate(q.createdAt)}</td></tr>
              {q.validUntil ? <tr><td className="pr-3 text-slate-400">Valid until</td><td className="font-medium">{fmtDate(q.validUntil)}</td></tr> : null}
              <tr><td className="pr-3 text-slate-400">Currency</td><td className="font-medium">{q.currency}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Bill to */}
        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Prepared for</div>
          <div className="mt-1 font-semibold text-slate-800">{q.customer?.companyName ?? '—'}</div>
          <div className="text-[12px] text-slate-600">
            {[q.customer?.address, q.customer?.city, q.customer?.country].filter(Boolean).join(', ')}
            {q.customer?.trn ? <div>TRN: {q.customer.trn}</div> : null}
            {contact ? (
              <div className="mt-1">
                Attn: {contact.name}{contact.designation ? `, ${contact.designation}` : ''}
                {contact.email ? ` · ${contact.email}` : ''}{contact.phone ? ` · ${contact.phone}` : ''}
              </div>
            ) : null}
          </div>
        </div>

        {/* Items */}
        <table className="mt-6 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#0A2540] text-left text-white">
              <th className="w-8 px-2 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="w-12 px-2 py-2 text-center font-medium">Qty</th>
              <th className="w-24 px-2 py-2 text-right font-medium">Unit price</th>
              <th className="w-12 px-2 py-2 text-right font-medium">Disc</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((it, i) => {
              const img = productImageUrl(it.product?.image)
              const specs = [
                it.product?.productType,
                it.product?.modelNo ? `Model ${it.product.modelNo}` : null,
                it.product?.sample ? `Sample: ${it.product.sample}` : null,
                it.product?.output ? `Output: ${it.product.output}` : null,
                it.product?.standards?.length ? `Standards: ${it.product.standards.join(', ')}` : null,
              ].filter(Boolean)
              return (
                <tr key={it.id} className="border-b border-slate-200 align-top">
                  <td className="px-2 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-3">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" width={54} height={40} className="h-10 w-[54px] shrink-0 rounded border border-slate-200 object-contain" />
                      ) : null}
                      <div>
                        <div className="font-medium text-slate-800">{it.productName}</div>
                        {specs.length ? <div className="text-[11px] text-slate-500">{specs.join(' · ')}</div> : null}
                        {it.note ? <div className="text-[11px] italic text-slate-500">{it.note}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-slate-700">{it.qty}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-700">{m(Number(it.unitPrice))}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-600">{Number(it.discountPct) > 0 ? `${Number(it.discountPct)}%` : '—'}</td>
                  <td className="px-2 py-2 text-right font-mono text-slate-800">{m(it.qty * Number(it.unitPrice) * (1 - Number(it.discountPct) / 100))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <table className="text-[13px]">
            <tbody>
              <tr><td className="pr-8 py-0.5 text-slate-500">Subtotal</td><td className="py-0.5 text-right font-mono">{m(t.subtotal)}</td></tr>
              {t.shipping > 0 ? <tr><td className="pr-8 py-0.5 text-slate-500">Shipping</td><td className="py-0.5 text-right font-mono">{m(t.shipping)}</td></tr> : null}
              {t.other > 0 ? <tr><td className="pr-8 py-0.5 text-slate-500">{q.otherChargesLabel || 'Other charges'}</td><td className="py-0.5 text-right font-mono">{m(t.other)}</td></tr> : null}
              <tr><td className="pr-8 py-0.5 text-slate-500">VAT ({Number(q.vatPercent)}%)</td><td className="py-0.5 text-right font-mono">{m(t.vat)}</td></tr>
              <tr className="border-t-2 border-[#0A2540]"><td className="pr-8 py-1 font-semibold text-[#0A2540]">Total</td><td className="py-1 text-right font-mono font-bold text-[#0A2540]">{m(t.total)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Delivery + payment + notes */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-[12px]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Delivery</div>
            <div className="text-slate-700">{q.deliveryTerms || '2–4 weeks from order confirmation'}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Payment terms</div>
            <div className="text-slate-700">{q.terms || '50% advance, balance before delivery'}</div>
          </div>
          {q.notes ? (
            <div className="col-span-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Notes</div>
              <div className="whitespace-pre-line text-slate-700">{q.notes}</div>
            </div>
          ) : null}
        </div>

        {/* Terms & conditions */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Terms &amp; conditions</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[11px] text-slate-500">
            {TERMS.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t-2 border-[#0A2540] pt-3 text-center text-[10px] text-slate-500">
          {COMPANY.legal} · {COMPANY.phone} · {COMPANY.email} · {COMPANY.web}
          <div className="mt-0.5">This is a computer-generated quotation and is valid without signature.</div>
        </footer>
      </div>
    </>
  )
}
