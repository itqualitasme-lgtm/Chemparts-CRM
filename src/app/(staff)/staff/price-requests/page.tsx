import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { priceState } from '@/lib/price'
import PageHeader from '@/components/ui/PageHeader'
import PriceRequestsTable, { type PriceRow, type RespondItem } from './PriceRequestsTable'

export const metadata = { title: 'Price requests - Chemparts Staff' }
export const dynamic = 'force-dynamic'

function fmtPrice(currency: string, value: number | null): string {
  if (value == null) return ''
  return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Stable client identity (matches the server action's grouping). */
function clientKeyOf(r: { customerId: string | null; guestEmail: string | null; guestName: string | null }): string {
  return r.customerId ? `c:${r.customerId}` : r.guestEmail ? `e:${r.guestEmail.toLowerCase()}` : `n:${r.guestName ?? '—'}`
}

const ACTIONABLE = new Set(['OPEN', 'AWAITING_INFO'])

export default async function StaffPriceRequestsPage() {
  await requirePortal('staff')

  const requests = await db.priceRequest.findMany({
    where: { status: { in: ['OPEN', 'AWAITING_INFO', 'QUOTED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 300,
    select: {
      id: true,
      qty: true,
      message: true,
      status: true,
      customerId: true,
      guestName: true,
      guestEmail: true,
      quotedPrice: true,
      quotedCurrency: true,
      validUntil: true,
      createdAt: true,
      customer: { select: { companyName: true, email: true, contacts: { where: { isPrimary: true }, take: 1, select: { email: true } } } },
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

  // Group this client's still-actionable items so one response can cover them all.
  const actionableByClient = new Map<string, RespondItem[]>()
  for (const r of requests) {
    if (!ACTIONABLE.has(r.status)) continue
    const key = clientKeyOf(r)
    const state = priceState({
      priceMode: r.product.priceMode,
      listPrice: r.product.listPrice != null ? Number(r.product.listPrice) : null,
      currency: r.product.currency,
      priceUpdatedAt: r.product.priceUpdatedAt,
    })
    const list = actionableByClient.get(key) ?? []
    list.push({
      id: r.id,
      productName: r.product.name,
      modelNo: r.product.modelNo,
      qty: r.qty,
      status: r.status,
      message: r.message,
      currentPrice: fmtPrice(state.currency, state.price),
      currentMode: state.mode,
      defaultCurrency: r.product.currency,
      defaultPrice: r.product.listPrice != null ? Number(r.product.listPrice) : null,
    })
    actionableByClient.set(key, list)
  }

  const rows: PriceRow[] = requests.map((r) => {
    const clientKey = clientKeyOf(r)
    const clientEmail = r.guestEmail ?? r.customer?.email ?? r.customer?.contacts[0]?.email ?? null
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
      contact: clientEmail,
      clientKey,
      clientEmail,
      siblings: actionableByClient.get(clientKey) ?? [],
      qty: r.qty,
      message: r.message,
      quotedText,
    }
  })

  const openCount = rows.filter((r) => r.status === 'OPEN').length
  const awaitingCount = rows.filter((r) => r.status === 'AWAITING_INFO').length

  return (
    <div>
      <PageHeader
        title="Price requests"
        subtitle={`${openCount} open${awaitingCount ? ` · ${awaitingCount} awaiting client info` : ''}.`}
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
