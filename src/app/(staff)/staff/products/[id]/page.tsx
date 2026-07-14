import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import ProductForm from '../ProductForm'
import ProductImages from '../ProductImages'
import { updateProduct, deleteProduct } from '../actions'
import DeleteButton from '@/components/DeleteButton'

export const metadata = { title: 'Edit product - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const returnTo = from && from.startsWith('/staff/products') ? from : '/staff/products'
  const [product, brands, user] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    getSessionUser(),
  ])
  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)

  return (
    <div>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={returnTo} className="hover:underline">
          Products
        </Link>{' '}
        / Edit
      </nav>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-900">{product.name}</h1>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm text-[#0A2540] underline"
          target="_blank"
        >
          View in store ↗
        </Link>
      </div>
      <ProductImages productId={product.id} image={product.image} images={product.images} />

      <ProductForm
        action={updateWithId}
        brands={brands}
        submitLabel="Save changes"
        returnTo={returnTo}
        initial={{
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          type: product.type,
          desc: product.desc,
          overview: product.overview ?? '',
          standards: product.standards,
          industries: product.industries,
          testTypes: product.testTypes,
          tags: product.tags,
          newUntil: product.newUntil ? product.newUntil.toISOString().slice(0, 10) : '',
          productType: product.productType ?? '',
          sample: product.sample ?? '',
          output: product.output ?? '',
          partnerStatus: product.partnerStatus ?? '',
          warranty: product.warranty ?? '',
          service: product.service ?? '',
          datasheetUrl: product.datasheetUrl ?? '',
          modelNo: product.modelNo ?? '',
          unit: product.unit,
          listPrice: product.listPrice != null ? Number(product.listPrice) : null,
          currency: product.currency,
          featured: product.featured,
          active: product.active,
        }}
      />

      {user && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50/40 p-6">
          <h2 className="font-medium text-red-800">Danger zone</h2>
          <p className="mb-3 text-sm text-slate-600">
            Permanently delete this product. Blocked if it appears in enquiries or carts — hide it instead.
          </p>
          <DeleteButton
            action={deleteProduct.bind(null, product.id, returnTo)}
            label="Delete product"
            confirmText={`Delete ${product.name}? This cannot be undone.`}
          />
        </div>
      )}
    </div>
  )
}
