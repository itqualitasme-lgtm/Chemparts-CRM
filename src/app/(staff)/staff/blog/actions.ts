'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { createAdminClient } from '@/lib/supabase/admin'

export type PostState = { error?: string }

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

/** Upload a blog cover image to Storage and return its public URL. */
export async function uploadBlogImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requirePortal('staff')
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image.' }
  if (file.size > MAX_BYTES) return { error: 'Image must be 5MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PNG, JPEG, WEBP or SVG.' }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  // No timestamp source in scripts, but here we run in the request runtime.
  const path = `blog/${Date.now()}-${Math.round(performance.now())}.${ext}`
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: `Upload failed: ${error.message}` }
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

async function uniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired) || 'post'
  let candidate = base
  let n = 2
  while (true) {
    const clash = await db.post.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!clash || clash.id === excludeId) return candidate
    candidate = `${base}-${n++}`
  }
}

function read(formData: FormData) {
  return {
    title: ((formData.get('title') as string | null) ?? '').trim(),
    slug: ((formData.get('slug') as string | null) ?? '').trim(),
    excerpt: ((formData.get('excerpt') as string | null) ?? '').trim() || null,
    body: ((formData.get('body') as string | null) ?? '').trim(),
    coverImage: ((formData.get('coverImage') as string | null) ?? '').trim() || null,
    published: formData.get('published') === 'true',
  }
}

export async function createPost(_prev: PostState, formData: FormData): Promise<PostState> {
  const user = await requirePortal('staff')
  const d = read(formData)
  if (d.title.length < 3) return { error: 'Enter a title.' }
  if (d.body.length < 10) return { error: 'Write the post body.' }
  const slug = await uniqueSlug(d.slug || d.title)
  await db.post.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt,
      body: d.body,
      coverImage: d.coverImage,
      published: d.published,
      publishedAt: d.published ? new Date() : null,
      authorName: user.fullName,
    },
  })
  revalidatePath('/staff/blog')
  revalidatePath('/blog')
  redirect('/staff/blog')
}

export async function updatePost(id: string, _prev: PostState, formData: FormData): Promise<PostState> {
  await requirePortal('staff')
  const d = read(formData)
  if (d.title.length < 3) return { error: 'Enter a title.' }
  if (d.body.length < 10) return { error: 'Write the post body.' }
  const existing = await db.post.findUnique({ where: { id }, select: { slug: true, publishedAt: true, published: true } })
  if (!existing) return { error: 'Post not found.' }
  const slug = d.slug ? await uniqueSlug(d.slug, id) : existing.slug
  await db.post.update({
    where: { id },
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt,
      body: d.body,
      coverImage: d.coverImage,
      published: d.published,
      // Stamp publishedAt the first time it goes live; keep it thereafter.
      publishedAt: d.published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
    },
  })
  revalidatePath('/staff/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  redirect('/staff/blog')
}

export async function deletePost(id: string): Promise<void> {
  await requirePortal('staff')
  await db.post.delete({ where: { id } })
  revalidatePath('/staff/blog')
  revalidatePath('/blog')
}
