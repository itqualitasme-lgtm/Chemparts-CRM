import SectionPage from '../SectionPage'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Lab Consumables & Reference Materials - UAE, Dubai, Qatar & Gulf',
  description: 'Laboratory consumables, reference materials and calibration standards across the UAE, Dubai, Qatar and the Gulf — NIST/NABL traceable where it matters. Recurring orders accepted.',
  alternates: { canonical: '/products/consumables' },
}

export default function ConsumablesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  return <SectionPage section="consumables" searchParams={searchParams} />
}
