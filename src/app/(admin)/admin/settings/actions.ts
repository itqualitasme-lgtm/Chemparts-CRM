'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { saveTickerMessages } from '@/lib/site-settings'

export type TickerState = { ok?: boolean; error?: string }
export type SalesState = { ok?: boolean; error?: string }

/** Save the header ticker messages (one per line in the textarea). */
export async function saveTicker(_prev: TickerState, formData: FormData): Promise<TickerState> {
  await requirePortal('staff')
  const raw = (formData.get('messages') as string | null) ?? ''
  const messages = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  if (messages.length === 0) return { error: 'Add at least one ticker message.' }
  await saveTickerMessages(messages)
  // The ticker renders in the shared site header on every marketing page.
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Add a sales person. */
export async function createSalesPerson(_prev: SalesState, formData: FormData): Promise<SalesState> {
  await requirePortal('staff')
  const name = ((formData.get('name') as string | null) ?? '').trim()
  if (name.length < 2) return { error: 'Enter the sales person’s name.' }
  const email = ((formData.get('email') as string | null) ?? '').trim() || null
  const phone = ((formData.get('phone') as string | null) ?? '').trim() || null
  await db.salesPerson.create({ data: { name, email, phone } })
  revalidatePath('/admin/settings')
  return { ok: true }
}

/** Toggle a sales person active/inactive (kept for history, not deleted). */
export async function toggleSalesPerson(id: string, active: boolean): Promise<void> {
  await requirePortal('staff')
  await db.salesPerson.update({ where: { id }, data: { active } })
  revalidatePath('/admin/settings')
}
