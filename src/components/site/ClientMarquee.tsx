import { db } from '@/lib/db'

// DB-driven "Trusted by" clients marquee. Staff-managed via /staff/clients.
export default async function ClientMarquee() {
  const clients = await db.client.findMany({
    where: { active: true, logo: { not: null } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, logo: true },
  })

  if (clients.length === 0) return null

  return (
    <section className="section section--tight">
      <div className="container">
        <div className="section-head">
          <div className="section-head__title">
            <span className="eyebrow">Trusted by</span>
            <h2 className="h-2">A short list of <em>clients</em>.</h2>
          </div>
          <p className="section-head__sub">Energy operators, national labs and universities across the UAE, Qatar and the wider Gulf.</p>
        </div>
      </div>
      <div className="marquee marquee--clients" data-reveal>
        <div className="marquee__track">
          {clients.map((c) => (
            <img key={c.id} width="100" height="28" src={c.logo as string} alt={c.name} />
          ))}
        </div>
      </div>
    </section>
  )
}
