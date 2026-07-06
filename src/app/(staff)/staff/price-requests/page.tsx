import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { priceState } from '@/lib/price'
import PageHeader from '@/components/ui/PageHeader'
import PriceRequestsTable, { type PriceRow } from './PriceRequestsTable'

export const metadata = { title: 'Price requests — Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtPrice(currency: string, value: number | null): string {
  if (value == null) return '—'
  return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function StaffPriceRequestsPage() {
  await requirePortal('staff')

  const requests = await db.priceRequest.findMany({
    where: { status: { in: ['OPEN', 'QUOTED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200,
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
          modelNo: true,
          listPrice: true,
          currency: true,
          priceMode: true,
          priceUpdatedAt: true,
          brand: { select: { name: true } },
        },
      },
    },
  })

  const rows: PriceRow[] = requests.map((r) => {
    const state = priceState({
      priceMode: r.product.priceMode,
      listPrice: r.product.listPrice != null ? Number(r.product.listPrice) : null,
      currency: r.product.currency,
      priceUpdatedAt: r.product.priceUpdatedAt,
    })
    const quotedText =
      r.status === 'QUOTED'
        ? `Quoted ${fmtPrice(r.quotedCurrency ?? r.product.currency, r.quotedPrice != null ? Number(r.quotedPrice) : null)}${
            r.validUntil ? ` · valid until ${fmtDate(r.validUntil)}` : ''
          }`
        : null
    return {
      id: r.id,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      productName: r.product.name,
      modelNo: r.product.modelNo,
      brand: r.product.brand.name,
      requester: r.customer?.companyName ?? r.guestName ?? 'Guest',
      contact: r.guestEmail,
      qty: r.qty,
      message: r.message,
      currentPrice: fmtPrice(state.currency, state.price),
      currentMode: state.mode,
      defaultCurrency: r.product.currency,
      defaultPrice: r.product.listPrice != null ? Number(r.product.listPrice) : null,
      quotedText,
    }
  })

  const openCount = rows.filter((r) => r.status === 'OPEN').length

  return (
    <div>
      <PageHeader
        title="Price requests"
        subtitle={`${openCount} open ${openCount === 1 ? 'request' : 'requests'} awaiting a confirmed price.`}
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-[13px] text-slate-500">
          No price requests yet.
        </div>
      ) : (
        <PriceRequestsTable requests={rows} />
      )}
    </div>
  )
}
