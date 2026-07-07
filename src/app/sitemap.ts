import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, posts] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.brand.findMany({ where: { slug: { not: '' } }, select: { slug: true, updatedAt: true } }),
    db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ])

  const staticPaths: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/products', priority: 0.9 },
    { path: '/products/instruments', priority: 0.8 },
    { path: '/products/consumables', priority: 0.8 },
    { path: '/products/spare-parts', priority: 0.8 },
    { path: '/partners', priority: 0.8 },
    { path: '/about', priority: 0.6 },
    { path: '/application', priority: 0.6 },
    { path: '/book-service', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/blog', priority: 0.5 },
    { path: '/faq', priority: 0.5 },
  ]

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((s) => ({ url: `${SITE_URL}${s.path}`, changeFrequency: 'weekly' as const, priority: s.priority })),
    ...brands.map((b) => ({ url: `${SITE_URL}/brands/${b.slug}`, lastModified: b.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/product?slug=${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ]

  return entries
}
