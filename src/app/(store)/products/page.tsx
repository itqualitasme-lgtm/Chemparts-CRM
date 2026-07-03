import Image from 'next/image'
import Link from 'next/link'
import { getBrands, getIndustries, getProducts } from '@/lib/catalog'

export const metadata = { title: 'Products — Chemparts Store' }

const INDUSTRY_LABELS: Record<string, string> = {
  petroleum: 'Petroleum',
  refineries: 'Refineries',
  environmental: 'Environmental',
  plastics: 'Plastics',
  materials: 'Materials',
  food: 'Food',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  const { q, brand, industry } = await searchParams
  const products = getProducts({ q, brand, industry })
  const brands = getBrands()
  const industries = getIndustries()

  const filterHref = (next: { brand?: string; industry?: string }) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const b = 'brand' in next ? next.brand : brand
    const i = 'industry' in next ? next.industry : industry
    if (b) params.set('brand', b)
    if (i) params.set('industry', i)
    const s = params.toString()
    return s ? `/products?${s}` : '/products'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold tracking-[0.25em] text-[#35769E]">
          ANALYTICAL INSTRUMENTS
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
        <p className="mt-1 text-slate-500">
          {brands.length} brands · XRF, flash point, distillation, viscosity and more. Spare parts
          &amp; consumables store coming soon.
        </p>
      </div>

      <form className="mb-4" action="/products" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, brand, test, standard…"
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
        />
        {brand && <input type="hidden" name="brand" value={brand} />}
        {industry && <input type="hidden" name="industry" value={industry} />}
      </form>

      <div className="mb-3 flex flex-wrap gap-2">
        <Link
          href={filterHref({ brand: undefined })}
          className={`rounded-full border px-3 py-1 text-xs ${!brand ? 'border-[#0A2540] bg-[#0A2540] text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
        >
          All brands
        </Link>
        {brands.map((b) => (
          <Link
            key={b.name}
            href={filterHref({ brand: b.name })}
            className={`rounded-full border px-3 py-1 text-xs ${brand === b.name ? 'border-[#0A2540] bg-[#0A2540] text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
          >
            {b.name} <span className="opacity-60">({b.count})</span>
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={filterHref({ industry: undefined })}
          className={`rounded-full border px-3 py-1 text-xs ${!industry ? 'border-[#35769E] bg-[#35769E] text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
        >
          All industries
        </Link>
        {industries.map((i) => (
          <Link
            key={i}
            href={filterHref({ industry: i })}
            className={`rounded-full border px-3 py-1 text-xs ${industry === i ? 'border-[#35769E] bg-[#35769E] text-white' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
          >
            {INDUSTRY_LABELS[i] ?? i}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-500">
        <strong className="text-slate-800">{products.length}</strong> instruments shown
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#0A2540]/40 hover:shadow-md"
          >
            <div className="relative mb-3 h-44 w-full overflow-hidden rounded-lg bg-slate-50">
              {p.image && (
                <Image
                  src={`/images/products/${p.image}`}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-contain p-2 transition group-hover:scale-[1.03]"
                />
              )}
            </div>
            <span className="mb-1 text-xs font-medium uppercase tracking-wide text-[#35769E]">
              {p.brand}
            </span>
            <h2 className="mb-1 font-medium text-slate-900 group-hover:text-[#0A2540]">{p.name}</h2>
            <p className="mb-3 line-clamp-2 text-sm text-slate-500">{p.desc}</p>
            <div className="mt-auto flex flex-wrap gap-1">
              {p.standards.slice(0, 3).map((s) => (
                <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No instruments match your filters.{' '}
          <Link href="/products" className="text-[#0A2540] underline">
            Clear all
          </Link>
        </div>
      )}
    </div>
  )
}
