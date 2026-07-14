import { notFound } from 'next/navigation'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PostForm from '../PostForm'
import { updatePost } from '../actions'

export const metadata = { title: 'Edit post - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortal('staff')
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) notFound()

  const updateWithId = updatePost.bind(null, id)

  return (
    <div>
      <h1 className="mb-4 text-base font-semibold text-slate-900">Edit post</h1>
      <PostForm
        action={updateWithId}
        submitLabel="Save changes"
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          body: post.body,
          coverImage: post.coverImage ?? '',
          published: post.published,
        }}
      />
    </div>
  )
}
