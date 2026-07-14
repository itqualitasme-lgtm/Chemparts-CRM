import Link from 'next/link'
import { db } from '@/lib/db'
import { productImageUrl } from '@/lib/product-image'
import PageHeader from '@/components/ui/PageHeader'
import DeleteButton from '@/components/DeleteButton'
import { deleteProduct } from './actions'
import type { Prisma } from '@/generated/prisma/client'

export const metadata = { title: 'Products — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

const TYPE_LABEL: Record<string, string> = {
  EQUIPMENT: 'Equipment',
  SPARE_PART: 'Spare part',
  CONSUMABLE: 'Consumable',
}
const STOCK: Record<string, { label: string; cls: string }> = {
  IN_STOCK: { label: 'In stock', cls: 'text-green-700' },
  ON_ORDER: { label: 'On order', cls: 'text-amber-600' },
  OUT_OF_STOCK: { label: 'Out of stock', cls: 'text-red-600' },
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
      { modelNo: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
      { standards: { has: q } },
    ]
  }

  const [total, rows, brands] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: {
        id: true, slug: true, name: true, type: true, active: true, featured: true, modelNo: true,
        image: true, listPrice: true, currency: true, stockStatus: true, brand: { select: { name: true } },
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

  // Current filtered list URL, threaded to Edit so saving/deleting returns here.
  const currentListUrl = (() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type) params.set('type', type)
    if (brandId) params.set('brand', brandId)
    if (status) params.set('status', status)
    if (page > 1) params.set('page', String(page))
    const s = params.toString()
    return s ? `/staff/products?${s}` : '/staff/products'
  })()
  const fromParam = `?from=${encodeURIComponent(currentListUrl)}`

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
      <PageHeader
        title="Products"
        subtitle={`${total} products in the catalog.`}
        action={
          <Link href="/staff/products/new" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#123a63]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Add product
          </Link>
        }
      />

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

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const stock = STOCK[p.stockStatus] ?? STOCK.IN_STOCK
              const img = productImageUrl(p.image)
              return (
                <tr key={p.id} className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70">
                  {/* Name = two-line: name + brand, with a small thumbnail */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="max-h-9 max-w-full object-contain" />
                        ) : (
                          <span className="text-[8px] text-slate-300"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="truncate text-xs text-slate-500">
                          {p.brand.name}
                          {p.modelNo ? <span className="ml-1.5 font-mono text-slate-400">· {p.modelNo}</span> : null}
                          {!p.active ? <span className="ml-1.5 text-slate-400">· Hidden</span> : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{TYPE_LABEL[p.type] ?? p.type}</td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-700">
                    {p.listPrice != null ? `${p.currency} ${Number(p.listPrice).toLocaleString('en-US')}` : <span className="text-slate-500">On request</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[13px] font-medium ${stock.cls}`}>{stock.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/staff/products/${p.id}${fromParam}`}
                        title="Edit"
                        aria-label={`Edit ${p.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10l7.5-7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                      </Link>
                      <DeleteButton
                        action={deleteProduct.bind(null, p.id, currentListUrl)}
                        title={`Delete ${p.name}`}
                        confirmText={`Delete "${p.name}"? This cannot be undone.`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4.5h10M6.5 4V3h3v1M5 4.5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </DeleteButton>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
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
