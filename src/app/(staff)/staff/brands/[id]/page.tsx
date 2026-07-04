import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { brandLogoUrl } from '@/lib/brand-image'
import EditBrandForm from './EditBrandForm'
import BrandLogoUpload from './BrandLogoUpload'

export const metadata = { title: 'Edit brand — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await db.brand.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      website: true,
      email: true,
      countryOfOrigin: true,
      focus: true,
      partnerSince: true,
      description: true,
      featured: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  })
  if (!brand) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/brands" className="text-sm text-slate-500 underline">
          ← Back to brands
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{brand.name}</h1>
        <p className="text-slate-500">
          {brand._count.products} product{brand._count.products === 1 ? '' : 's'} · edits sync to the public
          partners page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <BrandLogoUpload brandId={brand.id} currentLogo={brandLogoUrl(brand.logo)} />
        <EditBrandForm brandId={brand.id} brand={brand} />
      </div>
    </div>
  )
}
