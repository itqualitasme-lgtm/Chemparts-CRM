import { requirePortal } from '@/lib/auth/session'
import PostForm from '../PostForm'
import { createPost } from '../actions'

export const metadata = { title: 'New post — Chemparts Staff' }

export default async function NewPostPage() {
  await requirePortal('staff')
  return (
    <div>
      <h1 className="mb-4 text-base font-semibold text-slate-900">New post</h1>
      <PostForm action={createPost} submitLabel="Create post" />
    </div>
  )
}
