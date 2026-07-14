import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { renderMarkdown } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true }, select: { title: true, excerpt: true } })
  if (!post) return { title: 'Not found - Chemparts' }
  return { title: `${post.title} - Chemparts`, description: post.excerpt ?? undefined }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true } })
  if (!post) notFound()

  const html = renderMarkdown(post.body)

  return (
    <main id="main">
      <article className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p className="breadcrumb">
            <a href="/">[HOME]</a><span className="sep">/</span>
            <a href="/blog">[NEWS]</a>
          </p>

          <div className="section-head" style={{ display: 'block' }}>
            <span className="eyebrow">
              {post.publishedAt ? post.publishedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
              {post.authorName ? ` · ${post.authorName}` : ''}
            </span>
            <h1 className="h-1" style={{ marginTop: 12 }}>{post.title}</h1>
          </div>

          {post.coverImage ? (
            <figure style={{ margin: '24px 0', border: '1px solid var(--rule-c)', overflow: 'hidden', borderRadius: 4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', display: 'block' }} />
            </figure>
          ) : null}

          <div className="prose-post" dangerouslySetInnerHTML={{ __html: html }} />

          <hr className="rule" style={{ margin: '40px 0 24px' }} />
          <a className="btn btn--ghost" href="/blog">← All news</a>
        </div>
      </article>
    </main>
  )
}
