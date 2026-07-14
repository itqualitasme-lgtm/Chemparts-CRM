import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { quoteTotals } from '@/lib/quotation'

export const metadata = { title: 'My quotations - Chemparts' }
export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-amber-100 text-amber-800',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function MyQuotationsPage() {
  const user = await requirePortal('store')

  // Only quotations that have been sent to the customer (drafts stay internal).
  const quotations = user.customerId
    ? await db.quotation.findMany({
        where: { customerId: user.customerId, status: { in: ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          quotationNo: true,
          status: true,
          currency: true,
          vatPercent: true,
          validUntil: true,
          createdAt: true,
          notes: true,
          terms: true,
          shipping: true,
          otherCharges: true,
          otherChargesLabel: true,
          items: { orderBy: { sortOrder: 'asc' }, select: { productName: true, qty: true, unitPrice: true, discountPct: true, note: true } },
        },
      })
    : []

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">My quotations</h1>
      <p className="mb-6 text-slate-500">Priced offers from our team. Accept or query any line — just reply to the email or contact us.</p>

      {quotations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No quotations yet. Submit an enquiry and our team will send you a priced quotation.
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => {
            const t = quoteTotals(
              q.items.map((i) => ({ qty: i.qty, unitPrice: Number(i.unitPrice), discountPct: Number(i.discountPct) })),
              Number(q.vatPercent),
              { shipping: Number(q.shipping), other: Number(q.otherCharges) },
            )
            const m = (n: number) => `${q.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            return (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900">{q.quotationNo}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[q.status]}`}>{q.status}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {fmtDate(q.createdAt)}{q.validUntil ? ` · valid until ${fmtDate(q.validUntil)}` : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-500">
                        <th className="py-1.5 pr-3 font-medium">Item</th>
                        <th className="py-1.5 px-3 font-medium">Qty</th>
                        <th className="py-1.5 px-3 text-right font-medium">Unit</th>
                        <th className="py-1.5 pl-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.items.map((it, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="py-1.5 pr-3 text-slate-800">
                            {it.productName}
                            {it.note ? <span className="block text-xs text-slate-400">{it.note}</span> : null}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">{it.qty}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                            {m(Number(it.unitPrice))}
                            {Number(it.discountPct) > 0 ? <span className="block text-[11px] text-green-700">−{Number(it.discountPct)}%</span> : null}
                          </td>
                          <td className="py-1.5 pl-3 text-right font-mono text-slate-800">{m(it.qty * Number(it.unitPrice) * (1 - Number(it.discountPct) / 100))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 ml-auto max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono">{m(t.subtotal)}</span></div>
                  {t.shipping > 0 ? <div className="flex justify-between text-slate-600"><span>Shipping</span><span className="font-mono">{m(t.shipping)}</span></div> : null}
                  {t.other > 0 ? <div className="flex justify-between text-slate-600"><span>{q.otherChargesLabel || 'Other charges'}</span><span className="font-mono">{m(t.other)}</span></div> : null}
                  <div className="flex justify-between text-slate-600"><span>VAT ({Number(q.vatPercent)}%)</span><span className="font-mono">{m(t.vat)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900"><span>Total</span><span className="font-mono">{m(t.total)}</span></div>
                </div>

                {(q.terms || q.notes) && (
                  <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    {q.terms ? <p><span className="text-slate-400">Terms:</span> {q.terms}</p> : null}
                    {q.notes ? <p className="mt-1">{q.notes}</p> : null}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
