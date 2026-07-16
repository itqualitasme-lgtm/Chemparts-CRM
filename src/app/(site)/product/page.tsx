import { permanentRedirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// The old ported product.html page (/product?slug=x) hydrated stale client-side
// data from window.PRODUCTS and had its own non-responsive layout. Permanently
// redirect to the DB-driven PDP so old links and indexed URLs keep working.
export default async function LegacyProductRedirect({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  permanentRedirect(slug ? `/products/${encodeURIComponent(slug)}` : '/products')
}
