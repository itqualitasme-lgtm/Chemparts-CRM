// Compact 16px line icons for the portal sidebar, keyed by nav href.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function iconFor(href: string) {
  // dashboards / overviews
  if (href === '/admin' || href === '/staff' || href === '/vendor' || href === '/account')
    return <><rect x="2" y="2" width="5.5" height="5.5" rx="1" {...P} /><rect x="8.5" y="2" width="5.5" height="5.5" rx="1" {...P} /><rect x="2" y="8.5" width="5.5" height="5.5" rx="1" {...P} /><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" {...P} /></>
  if (href.includes('/enquiries')) return <><path d="M2 4h12v8H2z" {...P} /><path d="M2 5l6 4 6-4" {...P} /></>
  if (href.includes('/quotations')) return <><path d="M4 2h5l3 3v9H4z" {...P} /><path d="M9 2v3h3" {...P} /><path d="M6 8h4M6 10.5h4" {...P} /></>
  if (href.includes('/orders')) return <><path d="M2 5l6-3 6 3-6 3z" {...P} /><path d="M2 5v6l6 3 6-3V5" {...P} /><path d="M8 8v6" {...P} /></>
  if (href.includes('/service-requests')) return <><path d="M9.5 3a3 3 0 00-4 3.9L2.5 9.9a1.4 1.4 0 002 2l3-3A3 3 0 0011 4.5L9 6.5 8 5.5 10 3.5z" {...P} /></>
  if (href.includes('/price-requests')) return <><path d="M8 2H3v5l6 6 5-5-6-6z" {...P} /><circle cx="5.5" cy="4.5" r=".6" fill="currentColor" /></>
  if (href.includes('/customers')) return <><circle cx="6" cy="5" r="2.2" {...P} /><path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" {...P} /><path d="M11 5.2a2 2 0 010 3.6M11.5 9.6c1.5.4 2.5 1.4 2.5 3.1" {...P} /></>
  if (href.includes('/sales-people')) return <><circle cx="8" cy="5" r="2.4" {...P} /><path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4" {...P} /></>
  if (href.includes('/subscribers')) return <><path d="M2 4.5h10v6H2z" {...P} /><path d="M2 5.2l5 3.3 5-3.3" {...P} /><path d="M11 12.5h4M13 10.5v4" {...P} /></>

  if (href.includes('/products')) return <><path d="M8 1.7l5.5 3v6.6L8 14.3l-5.5-3V4.7z" {...P} /><path d="M2.7 4.8L8 7.6l5.3-2.8M8 7.6v6.7" {...P} /></>
  if (href.includes('/clients')) return <><path d="M2 14V4l4-2v12M6 14V6l5 2v6" {...P} /><path d="M8 8.5h1M8 11h1M3.5 6h1M3.5 9h1" {...P} /></>
  if (href.includes('/brands')) return <><path d="M3 2h6l5 5-6 6-5-5z" {...P} /><circle cx="6" cy="5" r="1" {...P} /></>
  if (href.includes('/stock')) return <><path d="M2 4.5L8 2l6 2.5L8 7z" {...P} /><path d="M2 8L8 10.5 14 8M2 11.5L8 14 14 11.5" {...P} /></>
  if (href.includes('/users')) return <><circle cx="6" cy="5" r="2.2" {...P} /><path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" {...P} /><path d="M11 5.2a2 2 0 010 3.6M11.5 9.6c1.5.4 2.5 1.4 2.5 3.1" {...P} /></>
  if (href.includes('/settings')) return <><circle cx="8" cy="8" r="2" {...P} /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" {...P} /></>
  if (href.includes('/reports')) return <><path d="M2 14V2M2 14h12" {...P} /><path d="M5 11V8M8 11V5M11 11V7" {...P} /></>
  if (href.includes('/purchase-orders')) return <><path d="M4 2h5l3 3v9H4z" {...P} /><path d="M9 2v3h3" {...P} /></>
  if (href.includes('/bills')) return <><path d="M4 2h8v12l-2-1-2 1-2-1-2 1z" {...P} /><path d="M6 6h4M6 8.5h4" {...P} /></>
  // fallback dot
  return <circle cx="8" cy="8" r="2.5" {...P} />
}

export default function NavIcon({ href, className = '' }: { href: string; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={className}>
      {iconFor(href)}
    </svg>
  )
}
