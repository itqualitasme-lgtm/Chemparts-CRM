import Link from 'next/link'
import { db } from '@/lib/db'
import ProductForm from '../ProductForm'
import { createProduct } from '../actions'

export const metadata = { title: 'New product - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const brands = await db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })

  return (
    <div>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/staff/products" className="hover:underline">
          Products
        </Link>{' '}
        / New
      </nav>
      <h1 className="mb-6 text-lg font-semibold text-slate-900">New product</h1>
      {brands.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add a brand first on the{' '}
          <Link href="/staff/brands" className="underline">
            Brands
          </Link>{' '}
          page.
        </p>
      ) : (
        <ProductForm action={createProduct} brands={brands} submitLabel="Create product" />
      )}
    </div>
  )
}
