import Link from 'next/link'
import { db } from '@/lib/db'
import { filterProducts, type CatalogProduct } from '@/lib/catalog-filter'

export const metadata = { title: 'Products — Chemparts Staff' }
export const dynamic = 'force-dynamic'

const TYPE_BADGE: Record<string, string> = {
  EQUIPMENT: 'bg-slate-100 text-slate-700',
  SPARE_PART: 'bg-amber-100 text-amber-800',
  CONSUMABLE: 'bg-sky-100 text-sky-800',
}

export default async function StaffProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const rows = await db.product.findMany({
    select: {
      id: true, slug: true, name: true, type: true, active: true, featured: true,
      listPrice: true, currency: true, desc: true, standards: true, testTypes: true,
      industries: true, brand: { select: { name: true } },
    },
    orderBy: [{ updatedAt: 'desc' }],
  })

  const mapped: (CatalogProduct & { id: string; active: boolean })[] = rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, brand: r.brand.name, type: r.type,
    featured: r.featured, image: null, images: [], desc: r.desc, industries: r.industries,
    testTypes: r.testTypes, specs: {}, standards: r.standards, overview: '',
    listPrice: r.listPrice != null ? Number(r.listPrice) : null, currency: r.currency,
    active: r.active,
  }))
  const products = q ? filterProducts(mapped, { q }) as typeof mapped : mapped

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500">{products.length} products in the catalog.</p>
        </div>
        <Link
          href="/staff/products/new"
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]"
        >
          + New product
        </Link>
      </div>

      <form className="mb-4" action="/staff/products" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, brand, standard…"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Brand</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{p.brand}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-2 py-0.5 text-xs ${TYPE_BADGE[p.type]}`}>
                    {p.type.replace('_', ' ').toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {p.listPrice != null ? `${p.currency} ${p.listPrice.toFixed(2)}` : '—'}
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
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
