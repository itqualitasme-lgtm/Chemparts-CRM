import SectionPage from '../SectionPage'

export const dynamic = 'force-dynamic'

export default function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  return <SectionPage section="spare-parts" searchParams={searchParams} />
}
