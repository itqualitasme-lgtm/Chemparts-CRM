'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { nextEnquiryNo } from '@/lib/enquiry-no'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import { looksLikeSpam } from '@/lib/spam'

export type ContactState = { ok?: boolean; error?: string; enquiryNo?: string }

const TOPICS = ['Quote', 'Service', 'Application', 'Other']

// Contact form → a staff-portal enquiry (channel WEBSITE, no product lines).
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: silently accept (so bots think it worked) but record nothing.
  if (((formData.get('website') as string | null) ?? '').trim()) return { ok: true, enquiryNo: '—' }

  const name = (formData.get('name') as string | null)?.trim() || ''
  const email = (formData.get('email') as string | null)?.trim() || ''
  const company = (formData.get('company') as string | null)?.trim() || null
  const phone = (formData.get('phone') as string | null)?.trim() || null
  const topicRaw = (formData.get('topic') as string | null)?.trim() || 'Other'
  const topic = TOPICS.includes(topicRaw) ? topicRaw : 'Other'
  const messageRaw = (formData.get('message') as string | null)?.trim() || ''

  if (!name || !email) return { error: 'Please enter your name and email so we can reply.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' }
  if (!messageRaw) return { error: 'Please add a short message.' }

  // Content spam (link/SEO spam slips past the honeypot): pretend success, record nothing.
  if (looksLikeSpam({ name, company, message: messageRaw })) return { ok: true, enquiryNo: '—' }

  const user = await getSessionUser()
  const message = `Topic: ${topic}\n\n${messageRaw}`

  const enquiryNo = await nextEnquiryNo()
  await db.enquiry.create({
    data: {
      enquiryNo,
      type: 'WEBSITE',
      customerId: user?.customerId ?? null,
      createdByProfile: user?.id ?? null,
      contactName: name,
      guestName: name,
      guestEmail: email,
      guestCompany: company,
      guestPhone: phone,
      message,
      status: 'OPEN',
    },
  })

  // Confirm to the sender + notify staff, after the response (non-blocking).
  after(async () => {
    await notify(email, 'contact-received', { name, enquiryNo })
    await notifyStaff('staff-new-enquiry', {
      enquiryNo,
      who: company || name,
      channel: 'website contact form',
      summary: `Topic: ${topic}. ${messageRaw}`.slice(0, 220),
      link: `${appUrl()}/staff/enquiries`,
    })
    await createNotification({ kind: 'ENQUIRY', title: `New enquiry ${enquiryNo}`, body: `${company || name} · contact form`, link: '/staff/enquiries', entity: 'Enquiry' })
  })

  return { ok: true, enquiryNo }
}
