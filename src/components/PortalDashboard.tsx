import Link from 'next/link'
import type { DashboardData, RecentRow } from '@/lib/dashboard'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function RecentList({ title, rows, hrefFor, viewAll }: { title: string; rows: RecentRow[]; hrefFor: (r: RecentRow) => string; viewAll: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <Link href={viewAll} className="text-xs font-medium text-[#0A2540] hover:underline">View all →</Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-400">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={hrefFor(r)} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-slate-50">
                <span className="min-w-0">
                  <span className="font-mono text-xs text-slate-500">{r.no}</span>
                  <span className="ml-2 truncate text-slate-700">{r.who}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PortalDashboard({ data, firstName, title }: { data: DashboardData; firstName: string; title: string }) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">{title}{firstName ? ` — ${firstName}` : ''}</h1>
        <p className="text-[13px] text-slate-500">Here&apos;s what needs attention today.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
        <StatCard label="New enquiries" value={data.enquiriesNew} href="/staff/enquiries" tone={data.enquiriesNew > 0 ? 'amber' : 'default'} hint={`${data.enquiriesOpen} open`} />
        <StatCard label="Quotations sent" value={data.quotationsSent} href="/staff/quotations" tone="indigo" hint={`${data.quotationsDraft} draft`} />
        <StatCard label="Active orders" value={data.ordersActive} href="/staff/orders" tone="blue" />
        <StatCard label="Price requests" value={data.priceOpen} href="/staff/price-requests" tone={data.priceOpen > 0 ? 'amber' : 'default'} hint="open" />
        <StatCard label="Service requests" value={data.serviceNew} href="/staff/service-requests" tone={data.serviceNew > 0 ? 'amber' : 'default'} hint="new" />
        <StatCard label="Products" value={data.products} href="/staff/products" hint="active" />
        <StatCard label="Customers" value={data.customers} href="/staff/customers" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <RecentList
          title="Recent enquiries"
          rows={data.recentEnquiries}
          hrefFor={() => '/staff/enquiries'}
          viewAll="/staff/enquiries"
        />
        <RecentList
          title="Recent quotations"
          rows={data.recentQuotations}
          hrefFor={(r) => `/staff/quotations/${r.id}`}
          viewAll="/staff/quotations"
        />
      </div>
    </div>
  )
}
