'use server'

import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { sendMail } from '@/lib/mail/send'

export type CampaignState = { error?: string }

/**
 * Create a campaign and send it to all active subscribers. The send runs after
 * the response (non-blocking) via after(); the campaign row tracks progress
 * (SENDING → SENT with sentCount). Intended for modest lists (< ~200).
 */
export async function sendCampaign(_prev: CampaignState, formData: FormData): Promise<CampaignState> {
  const user = await requirePortal('staff')
  const subject = ((formData.get('subject') as string | null) ?? '').trim()
  const body = ((formData.get('body') as string | null) ?? '').trim()
  if (subject.length < 3) return { error: 'Enter a subject line.' }
  if (body.length < 10) return { error: 'Write a message body.' }

  const subs = await db.subscriber.findMany({
    where: { active: true },
    select: { email: true, unsubscribeToken: true },
  })
  if (subs.length === 0) return { error: 'No active subscribers to send to.' }

  const campaign = await db.campaign.create({
    data: { subject, body, status: 'SENDING', recipientCount: subs.length, createdByName: user.fullName },
    select: { id: true },
  })

  after(async () => {
    let sent = 0
    for (const s of subs) {
      try {
        await sendMail(s.email, 'campaign', {
          subject,
          body,
          unsubscribeUrl: `${appUrl()}/unsubscribe?token=${s.unsubscribeToken}`,
        })
        sent++
      } catch {
        // logged in EmailLog by sendMail; keep going
      }
    }
    await db.campaign.update({
      where: { id: campaign.id },
      data: { status: 'SENT', sentCount: sent, sentAt: new Date() },
    })
  })

  revalidatePath('/staff/campaigns')
  redirect('/staff/campaigns')
}
