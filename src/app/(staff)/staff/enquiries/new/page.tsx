import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import EnquiryCreateForm from './EnquiryCreateForm'

export const metadata = { title: 'New enquiry — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function NewEnquiryPage() {
  await requirePortal('staff')

  const [customers, products] = await Promise.all([
    db.customer.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
    db.product.findMany({
      where: { active: true },
      select: { id: true, name: true, type: true, brand: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand.name,
    type: p.type,
  }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/enquiries" className="text-sm text-slate-500 underline">
          ← Back to enquiries
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">New enquiry</h1>
        <p className="text-slate-500">Log an enquiry from any channel. An enquiry is the starting point for a quotation.</p>
      </div>
      <EnquiryCreateForm customers={customers} products={productOptions} />
    </div>
  )
}
