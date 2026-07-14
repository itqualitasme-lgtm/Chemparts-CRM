import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'News & insights - Chemparts Middle East',
  description: 'Product news, application notes and updates from Chemparts Middle East.',
}

export default async function BlogIndexPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true, authorName: true },
  })

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <p className="breadcrumb"><a href="/">[HOME]</a><span className="sep">/</span>NEWS</p>
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">News &amp; insights</span>
              <h1 className="h-1">From the <em>Chemparts</em> team.</h1>
            </div>
            <p className="section-head__sub">Product news, application notes and updates from across the Gulf.</p>
          </div>

          {posts.length === 0 ? (
            <p className="body-lg" style={{ marginTop: 24 }}>No posts yet — check back soon.</p>
          ) : (
            <div className="products-page-grid" style={{ marginTop: 24 }}>
              {posts.map((p) => (
                <a key={p.slug} className="card" href={`/blog/${p.slug}`}>
                  {p.coverImage ? (
                    <div className="card__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.coverImage} alt={p.title} loading="lazy" decoding="async" />
                    </div>
                  ) : null}
                  <div className="card__body">
                    <span className="card__brand">
                      {p.publishedAt ? p.publishedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <h3 className="card__title">{p.title}</h3>
                    {p.excerpt ? <p className="card__desc">{p.excerpt}</p> : null}
                    <div className="card__foot">
                      <span className="mono text-muted">Read more</span>
                      <svg className="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.25" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
