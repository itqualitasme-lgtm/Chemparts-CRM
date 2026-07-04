import SectionPage from '../SectionPage'

export const dynamic = 'force-dynamic'

export default function InstrumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; industry?: string }>
}) {
  return <SectionPage section="instruments" searchParams={searchParams} />
}
