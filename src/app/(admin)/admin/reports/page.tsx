import { requireAdmin } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'

export const metadata = { title: 'Reports — Chemparts' }
export const dynamic = 'force-dynamic'

function money(n: number, currency = 'AED'): string {
  return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const ENQUIRY_STAGES = [
  { key: 'OPEN', label: 'Open', cls: 'bg-amber-500' },
  { key: 'WON', label: 'Won', cls: 'bg-green-500' },
  { key: 'REJECTED', label: 'Rejected', cls: 'bg-slate-400' },
]

export default async function ReportsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/staff')

  const [enquiryGroups, quotationGroups, products, brands, orders, confirmedSubs, openPriceReqs] = await Promise.all([
    db.enquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    db.quotation.groupBy({ by: ['status'], _count: { _all: true } }),
    db.product.groupBy({ by: ['type'], _count: { _all: true } }),
    db.product.groupBy({ by: ['brandId'], _count: { _all: true } }),
    db.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { status: true, currency: true, vatPercent: true, items: { select: { qty: true, unitPrice: true } } },
    }),
    db.subscriber.count({ where: { active: true } }),
    db.priceRequest.count({ where: { status: 'OPEN' } }),
  ])

  const enqCount = (s: string) => enquiryGroups.find((g) => g.status === s)?._count._all ?? 0
  const enqTotal = enquiryGroups.filter((g) => g.status !== 'SPAM').reduce((n, g) => n + g._count._all, 0)
  const enqSpam = enqCount('SPAM')
  const won = enqCount('WON')
  const decided = won + enqCount('REJECTED')
  const winRate = decided > 0 ? Math.round((won / decided) * 100) : 0

  const quoteCount = (s: string) => quotationGroups.find((g) => g.status === s)?._count._all ?? 0
  const quoteTotal = quotationGroups.reduce((n, g) => n + g._count._all, 0)
  const quoteSent = quoteCount('SENT') + quoteCount('ACCEPTED') + quoteCount('REJECTED') + quoteCount('EXPIRED')
  const quoteAccepted = quoteCount('ACCEPTED')
  const acceptRate = quoteSent > 0 ? Math.round((quoteAccepted / quoteSent) * 100) : 0

  // Order pipeline value (line totals + VAT), split into realized vs open.
  const orderValue = (o: (typeof orders)[number]) => {
    const net = o.items.reduce((n, it) => n + it.qty * Number(it.unitPrice), 0)
    return net * (1 + Number(o.vatPercent) / 100)
  }
  const realizedStatuses = new Set(['DELIVERED', 'CLOSED'])
  let realizedRevenue = 0
  let pipelineValue = 0
  for (const o of orders) {
    const v = orderValue(o)
    if (realizedStatuses.has(o.status)) realizedRevenue += v
    else pipelineValue += v
  }
  const currency = orders[0]?.currency ?? 'AED'

  const productTotal = products.reduce((n, g) => n + g._count._all, 0)
  const productByType = (t: string) => products.find((g) => g.type === t)?._count._all ?? 0

  // Top brands by catalogue size.
  const brandNames = await db.brand.findMany({
    where: { id: { in: brands.map((b) => b.brandId) } },
    select: { id: true, name: true },
  })
  const nameById = new Map(brandNames.map((b) => [b.id, b.name]))
  const topBrands = brands
    .map((b) => ({ name: nameById.get(b.brandId) ?? '—', count: b._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  const maxBrand = topBrands[0]?.count ?? 1

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales funnel, catalogue and revenue at a glance." />

      {/* Sales pipeline */}
      <h2 className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Sales pipeline</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Enquiries" value={enqTotal} href="/staff/enquiries" hint={enqSpam ? `${enqSpam} spam filtered` : 'all channels'} />
        <StatCard label="Open enquiries" value={enqCount('OPEN')} href="/staff/enquiries" tone="amber" hint="awaiting action" />
        <StatCard label="Win rate" value={`${winRate}%`} href="/staff/enquiries" tone="green" hint={`${won} won · ${enqCount('REJECTED')} rejected`} />
        <StatCard label="Quotations" value={quoteTotal} href="/staff/quotations" hint={`${quoteSent} sent`} />
        <StatCard label="Quote accept rate" value={`${acceptRate}%`} href="/staff/quotations" tone="indigo" hint={`${quoteAccepted} accepted`} />
        <StatCard label="Open price requests" value={openPriceReqs} href="/staff/price-requests" tone={openPriceReqs ? 'amber' : 'default'} hint="need a price" />
        <StatCard label="Realized revenue" value={money(realizedRevenue, currency)} href="/staff/orders" tone="green" hint="delivered & closed" />
        <StatCard label="Pipeline value" value={money(pipelineValue, currency)} href="/staff/orders" hint="open orders" />
      </div>

      {/* Enquiry funnel */}
      <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Enquiry funnel</h2>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        {ENQUIRY_STAGES.map((st) => {
          const c = enqCount(st.key)
          const pct = enqTotal > 0 ? Math.round((c / enqTotal) * 100) : 0
          return (
            <div key={st.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-slate-500">{st.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                <div className={`h-full ${st.cls}`} style={{ width: `${Math.max(pct, c > 0 ? 3 : 0)}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-xs tabular-nums text-slate-600">{c} · {pct}%</span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Catalogue */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Catalogue</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Products" value={productTotal} href="/staff/products" />
            <StatCard label="Equipment" value={productByType('EQUIPMENT')} href="/staff/products" />
            <StatCard label="Consumables" value={productByType('CONSUMABLE')} href="/staff/products" />
            <StatCard label="Spare parts" value={productByType('SPARE_PART')} href="/staff/products" />
            <StatCard label="Newsletter subscribers" value={confirmedSubs} href="/staff/subscribers" hint="confirmed" />
          </div>
        </div>

        {/* Top brands */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Top brands by catalogue</h2>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            {topBrands.length === 0 ? (
              <p className="text-sm text-slate-400">No products yet.</p>
            ) : (
              topBrands.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-xs text-slate-600" title={b.name}>{b.name}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full bg-[#0E7490]" style={{ width: `${Math.round((b.count / maxBrand) * 100)}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums text-slate-600">{b.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
