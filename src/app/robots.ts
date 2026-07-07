import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private/authenticated + transactional areas out of the index.
        disallow: ['/staff', '/admin', '/account', '/vendor', '/api', '/print', '/login', '/register', '/q/', '/cart', '/unsubscribe'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
