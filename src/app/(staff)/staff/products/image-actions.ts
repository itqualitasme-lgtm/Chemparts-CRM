'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export type ImageState = { error?: string; ok?: boolean }

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export async function uploadProductImage(
  productId: string,
  _prev: ImageState,
  formData: FormData,
): Promise<ImageState> {
  await requirePortal('staff')
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image file.' }
  if (file.size > MAX_BYTES) return { error: 'Image must be 5MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PNG, JPEG, WEBP or SVG.' }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, image: true, images: true },
  })
  if (!product) return { error: 'Product not found.' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${slugify(product.slug)}/${Date.now()}.${ext}`

  const supabase = createAdminClient()
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' })
  if (upErr) return { error: `Upload failed: ${upErr.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = data.publicUrl

  await db.product.update({
    where: { id: productId },
    data: {
      images: [...product.images, url],
      image: product.image ?? url, // first image becomes the primary
    },
  })

  revalidatePath(`/staff/products/${productId}`)
  revalidatePath('/staff/products')
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  revalidatePath(`/products/${product.slug}`)
  return { ok: true }
}

export async function setPrimaryImage(productId: string, url: string): Promise<void> {
  await requirePortal('staff')
  const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } })
  await db.product.update({ where: { id: productId }, data: { image: url } })
  revalidatePath(`/staff/products/${productId}`)
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  if (product) revalidatePath(`/products/${product.slug}`)
}

export async function removeProductImage(productId: string, url: string): Promise<void> {
  await requirePortal('staff')
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { slug: true, image: true, images: true },
  })
  if (!product) return

  const images = product.images.filter((i) => i !== url)
  const image = product.image === url ? (images[0] ?? null) : product.image
  await db.product.update({ where: { id: productId }, data: { images, image } })

  // Best-effort delete from storage if it's one of ours (a Supabase URL).
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx !== -1) {
    const path = url.slice(idx + marker.length)
    try {
      await createAdminClient().storage.from(BUCKET).remove([path])
    } catch {
      // ignore storage cleanup failures
    }
  }

  revalidatePath(`/staff/products/${productId}`)
  revalidatePath('/staff/products')
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  revalidatePath(`/products/${product.slug}`)
}
