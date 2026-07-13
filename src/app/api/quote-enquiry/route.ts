import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { nextEnquiryNo } from '@/lib/enquiry-no'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import { looksLikeSpam } from '@/lib/spam'

// Public endpoint for the site-wide "Get a quote" modal. The modal still opens
// WhatsApp; this logs a staff-portal enquiry (channel WEBSITE) in parallel.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // ignore — validated below
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const name = str(body.name)
  const email = str(body.email)
  const phone = str(body.phone) || null
  const company = str(body.company) || null
  const instrument = str(body.instrument)
  const messageRaw = str(body.message)
  const honeypot = str(body.website) // bots fill this hidden field

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false })
  }
  // Honeypot + content heuristics: pretend success but record nothing.
  if (honeypot || looksLikeSpam({ name, company, message: messageRaw, instrument })) {
    return NextResponse.json({ ok: true })
  }

  const parts: string[] = []
  if (instrument) parts.push(`Instrument: ${instrument}`)
  parts.push(messageRaw || 'Quote request from the website.')
  const message = `Topic: Quote\n\n${parts.join('\n\n')}`

  const enquiryNo = await nextEnquiryNo()
  await db.enquiry.create({
    data: {
      enquiryNo,
      type: 'WEBSITE',
      contactName: name,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      guestCompany: company,
      message,
      status: 'OPEN',
    },
  })

  after(async () => {
    await notify(email, 'contact-received', { name, enquiryNo })
    await notifyStaff('staff-new-enquiry', {
      enquiryNo,
      who: company || name,
      channel: 'website quote form',
      summary: message,
      link: `${appUrl()}/staff/enquiries`,
    })
    await createNotification({ kind: 'ENQUIRY', title: `New enquiry ${enquiryNo}`, body: `${company || name} · quote form`, link: '/staff/enquiries', entity: 'Enquiry' })
  })

  return NextResponse.json({ ok: true, enquiryNo })
}
