import SectionPage from '../SectionPage'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Analytical Instruments & Lab Equipment - UAE, Dubai, Qatar & Gulf',
  description: 'Buy analytical instruments and laboratory equipment in the UAE, Dubai and Qatar — XRF, flash point, distillation, NMR, FTIR and more. Authorized distributor across the Gulf. Request a quote.',
  alternates: { canonical: '/products/instruments' },
}

export default function InstrumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  return <SectionPage section="instruments" searchParams={searchParams} />
}
