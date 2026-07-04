'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { saveTickerMessages } from '@/lib/site-settings'

export type TickerState = { ok?: boolean; error?: string }

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
