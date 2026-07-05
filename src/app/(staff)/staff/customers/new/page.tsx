import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { getActiveSalesPeople } from '@/lib/sales'
import CustomerForm from '../CustomerForm'
import { createCustomer } from '../actions'

export const metadata = { title: 'New customer — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function NewCustomerPage() {
  await requirePortal('staff')
  const salesPeople = await getActiveSalesPeople()
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/staff/customers" className="text-sm text-slate-500 underline">
          ← Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">New customer</h1>
        <p className="text-slate-500">Company details, registration, payment terms and contact people. You can attach documents after creating.</p>
      </div>
      <CustomerForm action={createCustomer} mode="create" salesPeople={salesPeople} />
    </div>
  )
}
