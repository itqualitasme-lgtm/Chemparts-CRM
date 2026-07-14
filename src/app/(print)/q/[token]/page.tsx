import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { getCompanyBranches, resolveBranch } from '@/lib/company'
import QuotationDocument from '@/components/QuotationDocument'
import PrintButton from '../../print/quotation/[id]/PrintButton'

export const metadata = { title: 'Quotation - Chemparts', robots: { index: false } }
export const dynamic = 'force-dynamic'

// Public, no-login quotation view reached via the QR code / share link. Only
// resolvable with the exact publicToken; drafts are hidden.
export default async function PublicQuotationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const q = await db.quotation.findUnique({
    where: { publicToken: token },
    include: {
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
        orderBy: { sortOrder: 'asc' },
        include: {
          product: { select: { image: true, productType: true, sample: true, output: true, standards: true, modelNo: true, slug: true } },
        },
      },
    },
  })
  // Only expose quotations that have been sent to the customer.
  if (!q || q.status === 'DRAFT') notFound()

  const [qrDataUrl, branches] = await Promise.all([
    QRCode.toDataURL(`${appUrl()}/q/${token}`, { margin: 1, width: 200 }),
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
