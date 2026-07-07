import Link from 'next/link'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import BlogList from './BlogList'

export const metadata = { title: 'Blog — Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffBlogPage() {
  await requirePortal('staff')
  const rows = await db.post.findMany({
    orderBy: [{ published: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, slug: true, published: true, publishedAt: true, createdAt: true },
  })
  const posts = rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    published: p.published,
    date: (p.publishedAt ?? p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  }))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Blog / news</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">Posts published here appear on the public website at /blog.</p>
        </div>
        <Link href="/staff/blog/new" className="shrink-0 rounded-md bg-[#0A2540] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#123a63]">
          + New post
        </Link>
      </div>
      <BlogList posts={posts} />
    </div>
  )
}
