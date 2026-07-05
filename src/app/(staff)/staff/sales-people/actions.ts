'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

export type SalesState = { ok?: boolean; error?: string }

/** Add a sales person. */
export async function createSalesPerson(_prev: SalesState, formData: FormData): Promise<SalesState> {
  await requirePortal('staff')
  const name = ((formData.get('name') as string | null) ?? '').trim()
  if (name.length < 2) return { error: 'Enter the sales person’s name.' }
  const email = ((formData.get('email') as string | null) ?? '').trim() || null
  const phone = ((formData.get('phone') as string | null) ?? '').trim() || null
  await db.salesPerson.create({ data: { name, email, phone } })
  revalidatePath('/staff/sales-people')
  return { ok: true }
}

/** Toggle a sales person active/inactive (kept for history, not deleted). */
export async function toggleSalesPerson(id: string, active: boolean): Promise<void> {
  await requirePortal('staff')
  await db.salesPerson.update({ where: { id }, data: { active } })
  revalidatePath('/staff/sales-people')
}
