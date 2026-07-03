import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import ProductForm from '../ProductForm'
import { updateProduct } from '../actions'

export const metadata = { title: 'Edit product — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, brands] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)

  return (
    <div>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/staff/products" className="hover:underline">
          Products
        </Link>{' '}
        / Edit
      </nav>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm text-[#0A2540] underline"
          target="_blank"
        >
          View in store ↗
        </Link>
      </div>
      <ProductForm
        action={updateWithId}
        brands={brands}
        submitLabel="Save changes"
        initial={{
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          type: product.type,
          desc: product.desc,
          overview: product.overview ?? '',
          standards: product.standards,
          industries: product.industries,
          modelNo: product.modelNo ?? '',
          unit: product.unit,
          listPrice: product.listPrice != null ? Number(product.listPrice) : null,
          currency: product.currency,
          featured: product.featured,
          active: product.active,
        }}
      />
    </div>
  )
}
