import Link from 'next/link'
import { db } from '@/lib/db'
import { brandLogoUrl } from '@/lib/brand-image'
import BrandForm from './BrandForm'

export const metadata = { title: 'Brands — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffBrandsPage() {
  const brands = await db.brand.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
      website: true,
      countryOfOrigin: true,
      featured: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Brands</h1>
      <p className="mb-6 text-slate-500">
        Manufacturer and supplier brands. Logo, website and details here sync to the public partners page.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2.5 font-medium">Sort</th>
                <th className="px-4 py-2.5 font-medium">Brand</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Products</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => {
                const logo = brandLogoUrl(b.logo)
                return (
                  <tr key={b.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-slate-400">{b.sortOrder}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt="" className="max-h-8 max-w-14 object-contain" />
                          ) : (
                            <span className="text-[10px] text-slate-400">no logo</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {b.name}
                            {b.featured && (
                              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                                Featured
                              </span>
                            )}
                          </div>
                          {b.website && <div className="text-xs text-slate-500">{b.website}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{b.countryOfOrigin ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{b._count.products}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/staff/brands/${b.id}`} className="text-[#0A2540] underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
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
