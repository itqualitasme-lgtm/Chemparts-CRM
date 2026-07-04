import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { priceState } from '@/lib/price'
import RespondForm from './RespondForm'

export const metadata = { title: 'Price requests — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtPrice(currency: string, value: number | null): string {
  if (value == null) return '—'
  return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  QUOTED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-100 text-slate-600',
}

const MODE_BADGE: Record<string, string> = {
  listed: 'bg-green-100 text-green-800',
  indicative: 'bg-amber-100 text-amber-800',
  on_request: 'bg-slate-100 text-slate-600',
}

export default async function StaffPriceRequestsPage() {
  await requirePortal('staff')

  const requests = await db.priceRequest.findMany({
    where: { status: { in: ['OPEN', 'QUOTED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    select: {
      id: true,
      qty: true,
      message: true,
      status: true,
      guestName: true,
      guestEmail: true,
      quotedPrice: true,
      quotedCurrency: true,
      validUntil: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      product: {
        select: {
          name: true,
          listPrice: true,
          currency: true,
          priceMode: true,
          priceUpdatedAt: true,
          brand: { select: { name: true } },
        },
      },
    },
  })

  const openCount = requests.filter((r) => r.status === 'OPEN').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Price requests</h1>
        <p className="text-slate-500">
          {openCount} open {openCount === 1 ? 'request' : 'requests'} awaiting a confirmed price.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          No price requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const requester = r.customer?.companyName ?? r.guestName ?? 'Guest'
            const contact = r.guestEmail
            const state = priceState({
              priceMode: r.product.priceMode,
              listPrice: r.product.listPrice != null ? Number(r.product.listPrice) : null,
              currency: r.product.currency,
              priceUpdatedAt: r.product.priceUpdatedAt,
            })
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <h2 className="mt-1 font-medium text-slate-900">{r.product.name}</h2>
                    <p className="text-sm text-slate-500">{r.product.brand.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-500">Current price</div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-slate-800">
                        {fmtPrice(state.currency, state.price)}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-xs ${MODE_BADGE[state.mode]}`}>
                        {state.mode.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400">Requested by:</span> {requester}
                    {contact ? <span className="text-slate-400"> · {contact}</span> : null}
                  </div>
                  <div>
                    <span className="text-slate-400">Qty:</span> {r.qty}
                  </div>
                  {r.message ? (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Message:</span> {r.message}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  {r.status === 'OPEN' ? (
                    <RespondForm
                      requestId={r.id}
                      defaultCurrency={r.product.currency}
                      defaultPrice={r.product.listPrice != null ? Number(r.product.listPrice) : null}
                    />
                  ) : (
                    <p className="text-sm text-green-700">
                      Quoted {fmtPrice(r.quotedCurrency ?? r.product.currency, r.quotedPrice != null ? Number(r.quotedPrice) : null)}
                      {r.validUntil ? ` · valid until ${fmtDate(r.validUntil)}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
