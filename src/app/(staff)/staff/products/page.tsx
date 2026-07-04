import Link from 'next/link'
import { db } from '@/lib/db'
import { productImageUrl } from '@/lib/product-image'
import type { Prisma } from '@/generated/prisma/client'

export const metadata = { title: 'Products — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

const TYPE_BADGE: Record<string, string> = {
  EQUIPMENT: 'bg-slate-100 text-slate-700',
  SPARE_PART: 'bg-amber-100 text-amber-800',
  CONSUMABLE: 'bg-sky-100 text-sky-800',
}
const TYPES = [
  { value: '', label: 'All types' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'SPARE_PART', label: 'Spare part' },
]
const selectCls =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default async function StaffProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; brand?: string; status?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const type = sp.type ?? ''
  const brandId = sp.brand ?? ''
  const status = sp.status ?? ''
  const page = Math.max(1, Number(sp.page ?? '1') || 1)

  const where: Prisma.ProductWhereInput = {}
  if (type) where.type = type as Prisma.ProductWhereInput['type']
  if (brandId) where.brandId = brandId
  if (status === 'active') where.active = true
  if (status === 'hidden') where.active = false
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
      { standards: { has: q } },
    ]
  }

  const [total, rows, brands] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: {
        id: true, slug: true, name: true, type: true, active: true, featured: true,
        image: true, listPrice: true, currency: true, brand: { select: { name: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type) params.set('type', type)
    if (brandId) params.set('brand', brandId)
    if (status) params.set('status', status)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/staff/products?${s}` : '/staff/products'
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500">{total} products in the catalog.</p>
        </div>
        <Link
          href="/staff/products/new"
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]"
        >
          + New product
        </Link>
      </div>

      {/* Filters */}
      <form method="get" action="/staff/products" className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, brand, standard…"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
        <select name="type" defaultValue={type} className={selectCls}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select name="brand" defaultValue={brandId} className={selectCls}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={selectCls}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <button type="submit" className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]">
          Filter
        </button>
        {(q || type || brandId || status) && (
          <Link href="/staff/products" className="px-2 text-sm text-slate-500 underline">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium"></th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Brand</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pl-4">
                  <div className="flex h-11 w-14 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                    {productImageUrl(p.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImageUrl(p.image)!} alt="" className="max-h-10 max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-slate-300">no image</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.brand.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-2 py-0.5 text-xs ${TYPE_BADGE[p.type]}`}>
                    {p.type.replace('_', ' ').toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {p.listPrice != null ? `${p.currency} ${Number(p.listPrice).toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-2.5">
                  {p.active ? (
                    <span className="text-xs text-green-700">Active</span>
                  ) : (
                    <span className="text-xs text-slate-400">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/staff/products/${p.id}`} className="text-[#0A2540] underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          {from}–{to} of {total}
        </span>
        <div className="flex items-center gap-1">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              ← Prev
            </Link>
          )}
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
