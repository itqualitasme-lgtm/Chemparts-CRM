import { db } from '@/lib/db'

// DB-driven "Brand partners" marquee. Reads the live Brand table so staff
// additions / deletions / logo uploads reflect on the homepage. Brands without
// a logo are skipped (nothing to show in a logo strip).
export default async function BrandMarquee() {
  const brands = await db.brand.findMany({
    where: { logo: { not: null } },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, logo: true },
  })

  if (brands.length === 0) return null

  // Split across two rows (forward + reverse) when there are enough logos, to
  // match the original two-track marquee; otherwise a single row.
  const mid = Math.ceil(brands.length / 2)
  const rowA = brands.length > 6 ? brands.slice(0, mid) : brands
  const rowB = brands.length > 6 ? brands.slice(mid) : []

  return (
    <section className="section section--tight" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head">
          <div className="section-head__title">
            <span className="eyebrow">Brand partners</span>
            <h2 className="h-2">{brands.length}+ specialist <em>brands</em>.</h2>
          </div>
          <p className="section-head__sub">Authorized regional partner for instruments built by category leaders.</p>
        </div>
      </div>
      <div className="marquee" data-reveal style={{ marginBottom: rowB.length ? 24 : undefined }}>
        <div className="marquee__track">
          {rowA.map((b) => (
            <img key={b.id} width="140" height="36" src={b.logo as string} alt={b.name} />
          ))}
        </div>
      </div>
      {rowB.length > 0 && (
        <div className="marquee marquee--reverse">
          <div className="marquee__track">
            {rowB.map((b) => (
              <img key={b.id} width="140" height="36" src={b.logo as string} alt={b.name} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
