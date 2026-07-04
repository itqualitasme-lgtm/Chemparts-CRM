// Three linked cards pointing at the DB-driven catalog sections. Presentational
// server component; styled with the ported site's own CSS classes so it matches
// the existing catalog (the (site) group is excluded from Tailwind scanning).

const SECTIONS = [
  {
    href: '/products/instruments',
    label: 'Instruments',
    desc: 'Analytical instruments & equipment — request a quote.',
  },
  {
    href: '/products/consumables',
    label: 'Consumables',
    desc: 'Lab consumables & reference materials — priced where available.',
  },
  {
    href: '/products/spare-parts',
    label: 'Spare parts',
    desc: 'Genuine OEM spare parts, held in regional stock.',
  },
]

export default function SectionCards() {
  return (
    <div className="products-page-grid" style={{ marginBottom: 8 }}>
      {SECTIONS.map((s) => (
        <a key={s.href} className="card" href={s.href}>
          <div className="card__body">
            <span className="card__brand">Browse section</span>
            <h3 className="card__title">{s.label}</h3>
            <p className="card__desc">{s.desc}</p>
            <div className="card__foot">
              <span className="mono text-muted">View {s.label.toLowerCase()}</span>
              <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
