import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { getCompanyBranches, resolveBranch } from '@/lib/company'
import QuotationDocument from '@/components/QuotationDocument'
import PrintButton from './PrintButton'

export const metadata = { title: 'Quotation', robots: { index: false } }
export const dynamic = 'force-dynamic'

const QUOTATION_INCLUDE = {
  salesPerson: { select: { name: true, email: true, phone: true } },
  customer: {
    select: {
      companyName: true,
      address: true,
      city: true,
      country: true,
      trn: true,
      contacts: { where: { isPrimary: true }, take: 1, select: { name: true, designation: true, email: true, phone: true } },
    },
  },
  items: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      product: { select: { image: true, productType: true, sample: true, output: true, standards: true, modelNo: true, slug: true } },
    },
  },
} as const

export default async function QuotationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params

  const q = await db.quotation.findUnique({ where: { id }, include: QUOTATION_INCLUDE })
  if (!q) notFound()

  const [qrDataUrl, branches] = await Promise.all([
    q.publicToken ? QRCode.toDataURL(`${appUrl()}/q/${q.publicToken}`, { margin: 1, width: 200 }) : null,
    getCompanyBranches(),
  ])
  const company = resolveBranch(branches, q.companyBranchId)

  return (
    <>
      <PrintButton />
      <QuotationDocument q={q} qrDataUrl={qrDataUrl} company={company} />
    </>
  )
}
