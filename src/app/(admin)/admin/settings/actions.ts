'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { saveTickerMessages } from '@/lib/site-settings'
import { saveCompanyBranches, type CompanyBranch } from '@/lib/company'

export type TickerState = { ok?: boolean; error?: string }
export type BranchesState = { ok?: boolean; error?: string }

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
