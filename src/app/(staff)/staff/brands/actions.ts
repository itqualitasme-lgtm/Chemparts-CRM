'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { brandSchema } from '@/lib/validation/brand'

export type BrandState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean }

export async function createBrand(_prev: BrandState, formData: FormData): Promise<BrandState> {
  const user = await requirePortal('staff')
  const parsed = brandSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }
  const { name, description } = parsed.data

  const existing = await db.brand.findUnique({ where: { name } })
  if (existing) return { error: `Brand "${name}" already exists.` }

  const brand = await db.brand.create({
    data: { name, description: description || null },
  })
  await db.auditLog.create({
    data: { actorId: user.id, action: 'CREATE', entity: 'Brand', entityId: brand.id, detail: { name } },
  })

  revalidatePath('/staff/brands')
  revalidatePath('/products')
  return { ok: true }
}
