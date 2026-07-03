import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/catalog'
import { getSessionUser } from '@/lib/auth/session'

export async function generateStaticParams() {
  return getProducts({}).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  return { title: product ? `${product.name} — Chemparts Store` : 'Product — Chemparts Store' }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const user = await getSessionUser()
  const enquiryHref = user
    ? `/account/enquiries/new?product=${product.slug}`
    : `/register?product=${product.slug}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/products" className="hover:text-[#0A2540] hover:underline">
          Products
        </Link>{' '}
        / <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="relative h-80 w-full">
            {product.image && (
              <Image
                src={`/images/products/${product.image}`}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>

        <div>
          <span className="mb-2 inline-block rounded bg-[#35769E]/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#35769E]">
            {product.brand}
          </span>
          <h1 className="mb-3 text-3xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mb-6 text-slate-600">{product.overview || product.desc}</p>

          <div className="mb-6 flex flex-wrap gap-1.5">
            {product.standards.map((s) => (
              <span key={s} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {s}
              </span>
            ))}
            {product.industries.map((i) => (
              <span key={i} className="rounded bg-[#0A2540]/5 px-2 py-1 text-xs capitalize text-[#0A2540]">
                {i}
              </span>
            ))}
          </div>

          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-100 last:border-0">
                    <td className="w-1/3 bg-slate-50 px-4 py-2.5 font-medium capitalize text-slate-700">
                      {key}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-[#0A2540] p-6 text-white">
            <h2 className="mb-1 font-semibold">Request a quotation</h2>
            <p className="mb-4 text-sm text-slate-300">
              Full specification, sample-suitability assessment and pricing — same working-day
              response.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={enquiryHref}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-[#0A2540] transition hover:bg-slate-200"
              >
                {user ? 'Send enquiry' : 'Register & enquire'}
              </Link>
              <a
                href={`mailto:info@chemparts-me.com?subject=Quotation request — ${encodeURIComponent(product.name)}`}
                className="rounded-lg border border-white/40 px-5 py-2.5 text-sm text-white transition hover:bg-white/10"
              >
                Email us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
