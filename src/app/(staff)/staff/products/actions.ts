'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { productSchema, splitList } from '@/lib/validation/product'
import { slugify } from '@/lib/slug'

export type ProductState = { error?: string; fieldErrors?: Record<string, string[]> }

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

  const brand = await db.brand.findUnique({ where: { id: d.brandId }, select: { id: true } })
  if (!brand) return { error: 'Selected brand no longer exists.' }

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
      industries: splitList(d.industries),
      testTypes: [],
      modelNo: d.modelNo || null,
      unit: d.unit || 'pc',
      listPrice: d.listPrice,
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
  revalidatePath('/products')
  redirect('/staff/products')
}

export async function updateProduct(id: string, _prev: ProductState, formData: FormData): Promise<ProductState> {
  const user = await requirePortal('staff')
  const parsed = parse(formData)
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  const d = parsed.data

  const existing = await db.product.findUnique({ where: { id }, select: { id: true, slug: true } })
  if (!existing) return { error: 'Product not found.' }

  const brand = await db.brand.findUnique({ where: { id: d.brandId }, select: { id: true } })
  if (!brand) return { error: 'Selected brand no longer exists.' }

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
      industries: splitList(d.industries),
      modelNo: d.modelNo || null,
      unit: d.unit || 'pc',
      listPrice: d.listPrice,
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
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  redirect('/staff/products')
}
