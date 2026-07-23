'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'
import { productSchema, splitList, splitTags } from '@/lib/validation/product'
import { slugify } from '@/lib/slug'
import { INDUSTRY_IDS, TEST_TYPE_IDS } from '@/lib/taxonomy'
import { categorizeProduct } from '@/lib/categorize'

export type ProductState = { error?: string; fieldErrors?: Record<string, string[]> }

/**
 * Industry / test-type ids for a product: use the staff picks when present,
 * else auto-derive from the name/description/brand so the public filters stay
 * populated for newly-added products.
 */
function resolveTaxonomy(formData: FormData, d: { name: string; desc: string }, brandName?: string) {
  const industries = pickIds(formData, 'industries', INDUSTRY_IDS)
  const testTypes = pickIds(formData, 'testTypes', TEST_TYPE_IDS)
  if (industries.length && testTypes.length) return { industries, testTypes }
  const auto = categorizeProduct({ brand: brandName, name: d.name, desc: d.desc })
  return {
    industries: industries.length ? industries : auto.industries,
    testTypes: testTypes.length ? testTypes : auto.testTypes,
  }
}

/** Read a checkbox multi-select and keep only valid taxonomy ids. */
function pickIds(formData: FormData, field: string, allowed: Set<string>): string[] {
  return formData.getAll(field).map(String).filter((v) => allowed.has(v))
}

/** Only allow returning to a products-list URL (prevents open redirects). */
function safeReturn(to: string | null | undefined): string {
  return to && to.startsWith('/staff/products') ? to : '/staff/products'
}

/** Staff/admin: delete a product. Blocked if referenced by enquiries, carts or
 *  price requests (hide it instead); BOM links + price history cascade. */
export async function deleteProduct(id: string, returnTo?: string): Promise<{ error?: string }> {
  const user = await requirePortal('staff')

  const p = await db.product.findUnique({
    where: { id },
    select: {
      slug: true,
      images: true,
      _count: { select: { enquiryItems: true, cartItems: true, priceRequests: true } },
    },
  })
  if (!p) return { error: 'Product not found.' }
  if (p._count.enquiryItems > 0) return { error: 'This product appears in enquiries — hide it instead of deleting.' }
  if (p._count.cartItems > 0) return { error: 'This product is in a cart right now — try again once it clears.' }
  if (p._count.priceRequests > 0) return { error: 'This product has price requests — hide it instead of deleting.' }

  // Best-effort remove uploaded (Supabase) images; imported filenames are left.
  const bucket = 'product-images'
  const paths = p.images
    .map((u) => {
      const i = u.indexOf(`/${bucket}/`)
      return i === -1 ? null : u.slice(i + bucket.length + 2)
    })
    .filter((x): x is string => !!x)
  if (paths.length) {
    try {
      await createAdminClient().storage.from(bucket).remove(paths)
    } catch {
      // ignore
    }
  }

  await db.product.delete({ where: { id } })
  await db.auditLog.create({ data: { actorId: user.id, action: 'DELETE', entity: 'Product', entityId: id } })
  revalidatePath('/staff/products')
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  redirect(safeReturn(returnTo))
}

async function uniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(desired) || 'product'
  let candidate = baseSlug
  let n = 2
  // Loop until the slug is free (ignoring the row we're editing).
  while (true) {
    const clash = await db.product.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!clash || clash.id === excludeId) return candidate
    candidate = `${baseSlug}-${n++}`
  }
}

function parse(formData: FormData) {
  return productSchema.safeParse(Object.fromEntries(formData))
}

export async function createProduct(_prev: ProductState, formData: FormData): Promise<ProductState> {
  const user = await requirePortal('staff')
  const parsed = parse(formData)
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  const d = parsed.data

  const brand = await db.brand.findUnique({ where: { id: d.brandId }, select: { id: true, name: true } })
  if (!brand) return { error: 'Selected brand no longer exists.' }

  const tax = resolveTaxonomy(formData, d, brand.name)
  const slug = await uniqueSlug(d.slug || d.name)
  const product = await db.product.create({
    data: {
      slug,
      name: d.name,
      brandId: d.brandId,
      type: d.type,
      desc: d.desc,
      overview: d.overview || null,
      standards: splitList(d.standards),
      industries: tax.industries,
      tags: splitTags(d.tags),
      newUntil: d.newUntil ? new Date(d.newUntil) : null,
      testTypes: tax.testTypes,
      productType: d.productType || null,
      sample: d.sample || null,
      output: d.output || null,
      partnerStatus: d.partnerStatus || null,
      warranty: d.warranty || null,
      service: d.service || null,
      datasheetUrl: d.datasheetUrl || null,
      modelNo: d.modelNo || null,
      unit: d.unit || 'pc',
      listPrice: d.type === 'SPARE_PART' ? d.listPrice : null,
      priceMode: d.type === 'SPARE_PART' && d.listPrice != null ? 'LISTED' : 'ON_REQUEST',
      priceUpdatedAt: d.type === 'SPARE_PART' && d.listPrice != null ? new Date() : null,
      currency: d.currency,
      stockTracked: d.type !== 'EQUIPMENT',
      featured: !!d.featured,
      active: d.active ?? true,
    },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Product', entityId: product.id, detail: { slug, name: d.name } },
  })
  revalidatePath('/staff/products')
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  redirect('/staff/products')
}

export async function updateProduct(id: string, _prev: ProductState, formData: FormData): Promise<ProductState> {
  const user = await requirePortal('staff')
  const parsed = parse(formData)
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  const d = parsed.data

  const existing = await db.product.findUnique({ where: { id }, select: { id: true, slug: true } })
  if (!existing) return { error: 'Product not found.' }

  const brand = await db.brand.findUnique({ where: { id: d.brandId }, select: { id: true, name: true } })
  if (!brand) return { error: 'Selected brand no longer exists.' }

  const tax = resolveTaxonomy(formData, d, brand.name)
  const slug = d.slug ? await uniqueSlug(d.slug, id) : existing.slug
  await db.product.update({
    where: { id },
    data: {
      slug,
      name: d.name,
      brandId: d.brandId,
      type: d.type,
      desc: d.desc,
      overview: d.overview || null,
      standards: splitList(d.standards),
      industries: tax.industries,
      testTypes: tax.testTypes,
      tags: splitTags(d.tags),
      newUntil: d.newUntil ? new Date(d.newUntil) : null,
      productType: d.productType || null,
      sample: d.sample || null,
      output: d.output || null,
      partnerStatus: d.partnerStatus || null,
      warranty: d.warranty || null,
      service: d.service || null,
      datasheetUrl: d.datasheetUrl || null,
      modelNo: d.modelNo || null,
      unit: d.unit || 'pc',
      listPrice: d.type === 'SPARE_PART' ? d.listPrice : null,
      priceMode: d.type === 'SPARE_PART' && d.listPrice != null ? 'LISTED' : 'ON_REQUEST',
      priceUpdatedAt: d.type === 'SPARE_PART' && d.listPrice != null ? new Date() : null,
      currency: d.currency,
      stockTracked: d.type !== 'EQUIPMENT',
      featured: !!d.featured,
      active: d.active ?? true,
    },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'UPDATE', entity: 'Product', entityId: id, detail: { slug, name: d.name } },
  })
  revalidatePath('/staff/products')
  revalidatePath('/products'); revalidateTag('catalog', 'max')
  revalidatePath(`/products/${slug}`)
  redirect(safeReturn((formData.get('returnTo') as string | null) ?? undefined))
}
