'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { brandSchema } from '@/lib/validation/brand'
import { slugify } from '@/lib/slug'
import { createAdminClient } from '@/lib/supabase/admin'

export type BrandState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean }
export type LogoState = { error?: string; ok?: boolean }

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

/** Revalidate every surface a brand change touches — staff + public website. */
function revalidateBrand(brandId?: string) {
  revalidatePath('/staff/brands')
  if (brandId) revalidatePath(`/staff/brands/${brandId}`)
  revalidatePath('/partners')
  revalidatePath('/products')
  revalidatePath('/products/instruments')
  revalidatePath('/products/consumables')
  revalidatePath('/products/spare-parts')
}

export async function createBrand(_prev: BrandState, formData: FormData): Promise<BrandState> {
  const user = await requirePortal('staff')
  const parsed = brandSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const d = parsed.data

  const existing = await db.brand.findUnique({ where: { name: d.name } })
  if (existing) return { error: `Brand "${d.name}" already exists.` }

  const brand = await db.brand.create({
    data: {
      name: d.name,
      slug: slugify(d.name),
      website: d.website ?? null,
      email: d.email ?? null,
      countryOfOrigin: d.countryOfOrigin ?? null,
      focus: d.focus ?? null,
      partnerSince: d.partnerSince ?? null,
      description: d.description ?? null,
      featured: d.featured,
      sortOrder: d.sortOrder ?? 0,
    },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Brand', entityId: brand.id, detail: { name: d.name } },
  })

  revalidateBrand(brand.id)
  return { ok: true }
}

export async function updateBrand(
  brandId: string,
  _prev: BrandState,
  formData: FormData,
): Promise<BrandState> {
  const user = await requirePortal('staff')
  const parsed = brandSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const d = parsed.data

  const current = await db.brand.findUnique({ where: { id: brandId }, select: { id: true, slug: true } })
  if (!current) return { error: 'Brand not found.' }

  // Name must stay unique across other brands.
  const clash = await db.brand.findFirst({ where: { name: d.name, NOT: { id: brandId } }, select: { id: true } })
  if (clash) return { error: `Another brand is already named "${d.name}".` }

  await db.brand.update({
    where: { id: brandId },
    data: {
      name: d.name,
      slug: current.slug || slugify(d.name),
      website: d.website ?? null,
      email: d.email ?? null,
      countryOfOrigin: d.countryOfOrigin ?? null,
      focus: d.focus ?? null,
      partnerSince: d.partnerSince ?? null,
      description: d.description ?? null,
      featured: d.featured,
      sortOrder: d.sortOrder ?? 0,
    },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'UPDATE', entity: 'Brand', entityId: brandId, detail: { name: d.name } },
  })

  revalidateBrand(brandId)
  return { ok: true }
}

export async function uploadBrandLogo(
  brandId: string,
  _prev: LogoState,
  formData: FormData,
): Promise<LogoState> {
  await requirePortal('staff')
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a logo image.' }
  if (file.size > MAX_BYTES) return { error: 'Logo must be 5MB or smaller.' }
  if (!ALLOWED.includes(file.type)) return { error: 'Use PNG, JPEG, WEBP or SVG.' }

  const brand = await db.brand.findUnique({ where: { id: brandId }, select: { id: true, slug: true, logo: true } })
  if (!brand) return { error: 'Brand not found.' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `brands/${brand.slug || brandId}/${Date.now()}.${ext}`

  const supabase = createAdminClient()
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) return { error: `Upload failed: ${upErr.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  // Best-effort remove the previous uploaded logo (only if it was one of ours).
  await deleteStoredLogo(brand.logo)

  await db.brand.update({ where: { id: brandId }, data: { logo: data.publicUrl } })
  revalidateBrand(brandId)
  return { ok: true }
}

export async function removeBrandLogo(brandId: string): Promise<void> {
  await requirePortal('staff')
  const brand = await db.brand.findUnique({ where: { id: brandId }, select: { logo: true } })
  if (!brand) return
  await deleteStoredLogo(brand.logo)
  await db.brand.update({ where: { id: brandId }, data: { logo: null } })
  revalidateBrand(brandId)
}

/** Delete a logo from storage if the URL points at our bucket; ignore otherwise. */
async function deleteStoredLogo(logo: string | null): Promise<void> {
  if (!logo) return
  const marker = `/${BUCKET}/`
  const idx = logo.indexOf(marker)
  if (idx === -1) return
  const path = logo.slice(idx + marker.length)
  try {
    await createAdminClient().storage.from(BUCKET).remove([path])
  } catch {
    // ignore storage cleanup failures
  }
}
