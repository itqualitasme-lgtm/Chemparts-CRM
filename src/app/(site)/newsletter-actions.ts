'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { notify } from '@/lib/mail/notify'
import { looksLikeSpam, isBotEmail } from '@/lib/spam'

export type SubscribeState = { ok?: boolean; error?: string }

/**
 * Public newsletter signup (website footer). Double opt-in: we record the
 * address as pending and email a confirmation link. It only becomes active
 * (and campaign-eligible) once the recipient clicks it — this defeats
 * subscription-bombing, where a bot signs up other people's addresses.
 */
export async function subscribeNewsletter(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const name = ((formData.get('name') as string | null) ?? '').trim() || null
  const honeypot = ((formData.get('website') as string | null) ?? '').trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  // Honeypot + content/email heuristics — pretend success, record nothing.
  if (honeypot || isBotEmail(email) || looksLikeSpam({ name, email })) return { ok: true }

  const existing = await db.subscriber.findUnique({
    where: { email },
    select: { id: true, active: true, confirmedAt: true },
  })

  // Already confirmed & active — nothing to do, don't re-send anything.
  if (existing?.confirmedAt && existing.active) return { ok: true }

  const confirmToken = crypto.randomUUID()
  const sub = existing
    ? await db.subscriber.update({
        where: { id: existing.id },
        data: { name: name ?? undefined, confirmToken, active: false, confirmedAt: null },
      })
    : await db.subscriber.create({
        data: { email, name, source: 'website-footer', active: false, confirmToken },
      })

  after(async () => {
    await notify(email, 'newsletter-confirm', {
      name: name || 'there',
      confirmUrl: `${appUrl()}/newsletter/confirm?token=${sub.confirmToken}`,
    })
  })

  return { ok: true }
}

/** Complete double opt-in: the recipient clicked the confirmation link. */
export async function confirmNewsletter(token: string): Promise<{ ok?: boolean; email?: string }> {
  if (!token) return {}
  const sub = await db.subscriber.findUnique({ where: { confirmToken: token }, select: { id: true, email: true, unsubscribeToken: true, name: true } })
  if (!sub) return {}
  await db.subscriber.update({
    where: { id: sub.id },
    data: { active: true, confirmedAt: new Date(), confirmToken: null },
  })
  after(async () => {
    await notify(sub.email, 'newsletter-welcome', {
      name: sub.name || 'there',
      unsubscribeUrl: `${appUrl()}/unsubscribe?token=${sub.unsubscribeToken}`,
    })
  })
  return { ok: true, email: sub.email }
}

/** One-click unsubscribe via the token in the email footer. */
export async function confirmUnsubscribe(token: string): Promise<{ ok?: boolean }> {
  if (token) {
    await db.subscriber.updateMany({ where: { unsubscribeToken: token }, data: { active: false } })
  }
  return { ok: true }
}
