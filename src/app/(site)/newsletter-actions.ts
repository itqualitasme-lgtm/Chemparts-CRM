'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { notify } from '@/lib/mail/notify'
import { looksLikeSpam } from '@/lib/spam'

export type SubscribeState = { ok?: boolean; error?: string }

/** Public newsletter signup (website footer). Idempotent per email. */
export async function subscribeNewsletter(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const name = ((formData.get('name') as string | null) ?? '').trim() || null
  const honeypot = ((formData.get('website') as string | null) ?? '').trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  // Honeypot + content heuristics — pretend success, record nothing.
  if (honeypot || looksLikeSpam({ name, email })) return { ok: true }

  const existing = await db.subscriber.findUnique({ where: { email }, select: { id: true, active: true } })
  if (existing) {
    if (!existing.active) await db.subscriber.update({ where: { id: existing.id }, data: { active: true } })
    return { ok: true }
  }

  const sub = await db.subscriber.create({ data: { email, name, source: 'website-footer' } })

  after(async () => {
    await notify(email, 'newsletter-welcome', {
      name: name || 'there',
      unsubscribeUrl: `${appUrl()}/unsubscribe?token=${sub.unsubscribeToken}`,
    })
  })

  return { ok: true }
}

/** One-click unsubscribe via the token in the email footer. */
export async function confirmUnsubscribe(token: string): Promise<{ ok?: boolean }> {
  if (token) {
    await db.subscriber.updateMany({ where: { unsubscribeToken: token }, data: { active: false } })
  }
  return { ok: true }
}
