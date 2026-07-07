import SectionPage from '../SectionPage'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Genuine OEM Spare Parts for Lab Instruments — UAE, Qatar & Gulf',
  description: 'Genuine OEM spare parts for analytical instruments, held in regional stock across the UAE, Dubai, Qatar and the Gulf. No 6-week waits for a thermocouple, lamp or filter.',
  alternates: { canonical: '/products/spare-parts' },
}

export default function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  return <SectionPage section="spare-parts" searchParams={searchParams} />
}
