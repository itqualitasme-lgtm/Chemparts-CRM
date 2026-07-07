// Canonical public site URL for SEO (metadataBase, sitemap, canonicals,
// structured data). Override with NEXT_PUBLIC_SITE_URL if the live domain
// differs. Must be the domain you want Google to index — not the vercel.app URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chemparts-me.com').replace(/\/$/, '')

export const SITE_NAME = 'Chemparts Middle East'

// Regions we serve — woven into copy/metadata so brand + category searches
// like "Hitachi UAE" / "flash point tester Dubai" surface the site.
export const SERVICE_AREAS = ['UAE', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Qatar', 'Gulf', 'Middle East']

/** Organization + WebSite structured data for the homepage / root. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Chemparts Middle East FZC',
        alternateName: 'Chemparts',
        url: SITE_URL,
        logo: `${SITE_URL}/assets/images/cp-logo.png`,
        email: 'info@chemparts-me.com',
        description:
          'Authorized distributor of analytical instruments, OEM spare parts and laboratory consumables across the UAE, Qatar and the wider Gulf since 2003.',
        areaServed: SERVICE_AREAS.map((name) => ({ '@type': 'Place', name })),
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'A2-96, SAIF Zone',
          addressLocality: 'Sharjah',
          addressCountry: 'AE',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }
}
