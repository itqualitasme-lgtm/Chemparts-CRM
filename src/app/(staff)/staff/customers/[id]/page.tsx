import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import CustomerForm from '../CustomerForm'
import { updateCustomer } from '../actions'
import DocumentsPanel from './DocumentsPanel'

export const metadata = { title: 'Customer — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params

  const c = await db.customer.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
      documents: { orderBy: { createdAt: 'desc' } },
      _count: { select: { enquiries: true } },
    },
  })
  if (!c) notFound()

  const defaults = {
    companyName: c.companyName,
    country: c.country,
    city: c.city,
    address: c.address,
    trn: c.trn,
    tradeLicense: c.tradeLicense,
    industry: c.industry,
    paymentTerms: c.paymentTerms,
    creditLimit: c.creditLimit == null ? '' : String(c.creditLimit),
    currency: c.currency,
    phone: c.phone,
    email: c.email,
    website: c.website,
    notes: c.notes,
  }
  const initialContacts = c.contacts.map((p) => ({
    name: p.name,
    designation: p.designation ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    isPrimary: p.isPrimary,
  }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/customers" className="text-sm text-slate-500 underline">
          ← Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{c.companyName}</h1>
        <p className="text-slate-500">
          {c._count.enquiries} enquir{c._count.enquiries === 1 ? 'y' : 'ies'} · {c.contacts.length} contact
          {c.contacts.length === 1 ? '' : 's'}
        </p>
      </div>

      <CustomerForm
        action={updateCustomer.bind(null, c.id)}
        mode="edit"
        defaults={defaults}
        initialContacts={initialContacts}
      />

      <div className="mt-6">
        <DocumentsPanel customerId={c.id} documents={c.documents.map((d) => ({ id: d.id, label: d.label, url: d.url }))} />
      </div>
    </div>
  )
}
