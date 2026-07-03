import { db } from '@/lib/db'
import BrandForm from './BrandForm'

export const metadata = { title: 'Brands — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffBrandsPage() {
  const brands = await db.brand.findMany({
    select: { id: true, name: true, description: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Brands</h1>
      <p className="mb-6 text-slate-500">Manufacturer and supplier brands for the catalog.</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2.5 font-medium">Brand</th>
                <th className="px-4 py-2.5 font-medium">Products</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{b.name}</div>
                    {b.description && <div className="text-xs text-slate-500">{b.description}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{b._count.products}</td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    No brands yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <BrandForm />
      </div>
    </div>
  )
}
