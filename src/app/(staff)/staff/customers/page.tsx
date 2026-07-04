import Link from 'next/link'
import { db } from '@/lib/db'
import type { Prisma } from '@/generated/prisma/client'

export const metadata = { title: 'Customers — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

export default async function StaffCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const page = Math.max(1, Number(sp.page ?? '1') || 1)

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
          { trn: { contains: q, mode: 'insensitive' } },
          { contacts: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      }
    : {}

  const [total, customers] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        country: true,
        city: true,
        industry: true,
        paymentTerms: true,
        _count: { select: { contacts: true, enquiries: true } },
        contacts: { where: { isPrimary: true }, select: { name: true, designation: true }, take: 1 },
      },
      orderBy: { companyName: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/staff/customers?${s}` : '/staff/customers'
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-slate-500">{total} customer{total === 1 ? '' : 's'}.</p>
        </div>
        <Link
          href="/staff/customers/new"
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]"
        >
          + New customer
        </Link>
      </div>

      <form method="get" action="/staff/customers" className="mb-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search company, city, industry, TRN, contact…"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
        <button type="submit" className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#123a63]">
          Search
        </button>
        {q && (
          <Link href="/staff/customers" className="px-2 py-2 text-sm text-slate-500 underline">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium">Company</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Industry</th>
              <th className="px-4 py-2.5 font-medium">Primary contact</th>
              <th className="px-4 py-2.5 font-medium">Enquiries</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-800">{c.companyName}</td>
                <td className="px-4 py-2.5 text-slate-600">{[c.city, c.country].filter(Boolean).join(', ')}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.industry ?? '—'}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {c.contacts[0] ? (
                    <span>
                      {c.contacts[0].name}
                      {c.contacts[0].designation ? <span className="text-slate-400"> · {c.contacts[0].designation}</span> : null}
                    </span>
                  ) : (
                    <span className="text-slate-400">{c._count.contacts} contact{c._count.contacts === 1 ? '' : 's'}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{c._count.enquiries}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/staff/customers/${c.id}`} className="text-[#0A2540] underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {q ? 'No customers match your search.' : 'No customers yet. Create the first one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{from}–{to} of {total}</span>
        <div className="flex items-center gap-1">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">← Prev</Link>
          )}
          <span className="px-2">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Next →</Link>
          )}
        </div>
      </div>
    </div>
  )
}
