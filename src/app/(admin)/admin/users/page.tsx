import { requireAdmin } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import UsersTable, { type UserRow } from './UsersTable'

export const metadata = { title: 'Users & approvals - Chemparts' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/staff')

  const profiles = await db.profile.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], // PENDING sorts first
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      customer: { select: { companyName: true } },
      vendor: { select: { companyName: true } },
    },
  })

  const rows: UserRow[] = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.fullName,
    phone: p.phone,
    role: p.role,
    status: p.status,
    org: p.customer?.companyName ?? p.vendor?.companyName ?? null,
    createdAt: p.createdAt.toISOString(),
  }))

  const pending = rows.filter((r) => r.status === 'PENDING').length

  return (
    <div>
      <PageHeader
        title="Users & approvals"
        subtitle={`${rows.length} accounts${pending ? ` · ${pending} awaiting approval` : ''}.`}
      />
      <UsersTable rows={rows} selfId={admin.id} />
    </div>
  )
}
