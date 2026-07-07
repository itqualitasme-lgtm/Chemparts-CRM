'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { saveTickerMessages, saveContactInfo, DEFAULT_CONTACT } from '@/lib/site-settings'
import { saveCompanyBranches, type CompanyBranch } from '@/lib/company'

export type TickerState = { ok?: boolean; error?: string }
export type BranchesState = { ok?: boolean; error?: string }
export type ContactState = { ok?: boolean; error?: string }

/** Save the site contact details (phone/email/WhatsApp/hours). */
export async function saveContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  await requirePortal('staff')
  const str = (k: string) => ((formData.get(k) as string | null) ?? '').trim()
  const email = str('email')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  await saveContactInfo({
    phone: str('phone') || DEFAULT_CONTACT.phone,
    email: email || DEFAULT_CONTACT.email,
    whatsapp: str('whatsapp').replace(/[^\d]/g, '') || DEFAULT_CONTACT.whatsapp,
    whatsappDisplay: str('whatsappDisplay') || DEFAULT_CONTACT.whatsappDisplay,
    hours: str('hours') || DEFAULT_CONTACT.hours,
  })
  // Contact details render in the shared header/footer on every page.
  revalidatePath('/', 'layout')
  revalidatePath('/contact')
  return { ok: true }
}

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

/** Save the company branches / legal entities (submitted as JSON). */
export async function saveBranches(_prev: BranchesState, formData: FormData): Promise<BranchesState> {
  await requirePortal('staff')
  let parsed: unknown
  try {
    parsed = JSON.parse((formData.get('branchesJson') as string | null) ?? '[]')
  } catch {
    return { error: 'Could not read the branches — please try again.' }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return { error: 'Add at least one company entity.' }
  if (parsed.some((b) => !(b as { name?: string })?.name?.trim())) {
    return { error: 'Every entity needs a company name.' }
  }
  await saveCompanyBranches(parsed as CompanyBranch[])
  revalidatePath('/admin/settings')
  return { ok: true }
}
