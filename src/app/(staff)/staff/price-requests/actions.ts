'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { notify, INFO_INBOX } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'

export type RespondPriceState = { ok?: boolean; error?: string; emailed?: boolean; warning?: string }

/** One line in a combined response: either confirm a price, or ask for details. */
export type PriceUpdateItem = {
  requestId: string
  mode: 'quote' | 'ask'
  price?: number
  currency?: string
  validUntil?: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function fmtMoney(currency: string, value: number): string {
  return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Stable identity for a "client": the customer, else the guest email/name. */
function clientKeyOf(r: { customerId: string | null; guestEmail: string | null; guestName: string | null }): string {
  return r.customerId ? `c:${r.customerId}` : r.guestEmail ? `e:${r.guestEmail.toLowerCase()}` : `n:${r.guestName ?? '—'}`
}

/**
 * Respond to one client's open price requests in a single action:
 *  - "quote" items update the Product (listPrice/currency/priceUpdatedAt/priceMode=LISTED),
 *    write a PriceHistory row, and mark the request QUOTED (its terminal, closed state).
 *  - "ask" items move the request to AWAITING_INFO (staff need more requirement detail).
 *
 * The client gets ONE email covering every item, CC'd to the info inbox with
 * Reply-To: info@, so their reply lands in the shared inbox and staff can carry
 * the thread on. If the client has no email on file, changes are still saved and
 * the caller is warned that nothing was sent.
 */
export async function sendPriceUpdate(input: {
  message?: string
  items: PriceUpdateItem[]
}): Promise<RespondPriceState> {
  const user = await requirePortal('staff')

  const items = (input.items ?? []).filter((i) => i && typeof i.requestId === 'string')
  if (items.length === 0) return { error: 'Nothing to send — choose a price or "ask for details" on at least one item.' }

  const ids = items.map((i) => i.requestId)
  const requests = await db.priceRequest.findMany({
    where: { id: { in: ids }, status: { in: ['OPEN', 'AWAITING_INFO'] } },
    select: {
      id: true,
      qty: true,
      status: true,
      customerId: true,
      guestName: true,
      guestEmail: true,
      customer: { select: { companyName: true, email: true, contacts: { where: { isPrimary: true }, take: 1, select: { email: true } } } },
      product: { select: { id: true, name: true, modelNo: true, listPrice: true, currency: true } },
    },
  })
  if (requests.length === 0) return { error: 'These requests have already been handled.' }

  // Every item must belong to the same client — the email goes to one recipient.
  const keys = new Set(requests.map(clientKeyOf))
  if (keys.size > 1) return { error: 'All items in one update must be for the same client.' }

  const byId = new Map(requests.map((r) => [r.id, r]))
  const now = new Date()

  type EmailRow = { name: string; qty: number; modelNo: string | null; outcome: string; ask: boolean }
  const emailRows: EmailRow[] = []
  let quotedCount = 0
  let askedCount = 0

  // Pre-validate every item before touching the DB, so nothing partially applies.
  type Plan = { req: (typeof requests)[number]; mode: 'quote' | 'ask'; price?: number; currency?: string; validUntil?: Date | null }
  const plans: Plan[] = []
  for (const item of items) {
    const req = byId.get(item.requestId)
    if (!req) continue

    if (item.mode === 'quote') {
      const price = Math.round(Number(item.price) * 100) / 100
      if (!Number.isFinite(price) || price <= 0) return { error: `Enter a valid price for ${req.product.name}.` }
      const currency = (item.currency?.trim() || req.product.currency || 'AED').toUpperCase()
      let validUntil: Date | null = null
      if (item.validUntil?.trim()) {
        const d = new Date(item.validUntil)
        if (!Number.isNaN(d.getTime())) validUntil = d
      }
      plans.push({ req, mode: 'quote', price, currency, validUntil })
      quotedCount++
      emailRows.push({
        name: req.product.name,
        qty: req.qty,
        modelNo: req.product.modelNo,
        outcome: `${fmtMoney(currency, price)}${validUntil ? ` &middot; valid until ${esc(fmtDate(validUntil))}` : ''}`,
        ask: false,
      })
    } else {
      plans.push({ req, mode: 'ask' })
      askedCount++
      emailRows.push({ name: req.product.name, qty: req.qty, modelNo: req.product.modelNo, outcome: 'We need a few more details - please reply to this email.', ask: true })
    }
  }
  if (plans.length === 0) return { error: 'Nothing to update.' }

  await db.$transaction(async (tx) => {
    for (const p of plans) {
      if (p.mode === 'quote') {
        await tx.product.update({
          where: { id: p.req.product.id },
          data: { listPrice: p.price!, currency: p.currency!, priceUpdatedAt: now, priceMode: 'LISTED' },
        })
        await tx.priceHistory.create({
          data: { productId: p.req.product.id, oldPrice: p.req.product.listPrice ?? null, newPrice: p.price!, currency: p.currency!, changedById: user.id, changedAt: now },
        })
        await tx.priceRequest.update({
          where: { id: p.req.id },
          data: { quotedPrice: p.price!, quotedCurrency: p.currency!, validUntil: p.validUntil ?? null, status: 'QUOTED', respondedByProfile: user.id, respondedAt: now },
        })
      } else {
        await tx.priceRequest.update({
          where: { id: p.req.id },
          data: { status: 'AWAITING_INFO', respondedByProfile: user.id, respondedAt: now },
        })
      }
    }
  })

  // Resolve the client's email, then send ONE combined message.
  const first = requests[0]
  const to = first.guestEmail ?? first.customer?.email ?? first.customer?.contacts[0]?.email ?? null
  const name = first.guestName ?? first.customer?.companyName ?? 'there'

  const itemsHtml =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px">` +
    emailRows
      .map(
        (row) =>
          `<tr><td style="padding:10px 0;border-bottom:1px solid #edf1f5">` +
          `<div style="font-weight:bold;color:#0A2540">${esc(row.name)}${row.qty > 1 ? ` &times; ${row.qty}` : ''}</div>` +
          (row.modelNo ? `<div style="font-size:12px;color:#66788a">${esc(row.modelNo)}</div>` : '') +
          `<div style="margin-top:4px;font-size:15px;color:${row.ask ? '#9a3412' : '#0A2540'}">${row.outcome}</div>` +
          `</td></tr>`,
      )
      .join('') +
    `</table>`

  const subjectItem = emailRows.length === 1 ? emailRows[0].name : `${emailRows.length} items`
  let emailed = false
  if (to) {
    emailed = await notify(
      to,
      'price-update',
      { name, subject: `Your Chemparts price request - ${subjectItem}`, message: input.message?.trim() ?? '', itemsHtml },
      { cc: INFO_INBOX, replyTo: INFO_INBOX },
    )
  }

  // Staff-side trail for the awaiting-info items so nobody forgets to follow up.
  if (askedCount > 0) {
    after(() =>
      createNotification({
        kind: 'INFO',
        title: 'Price request - awaiting client info',
        body: `Asked ${name} for more details on ${askedCount} item${askedCount === 1 ? '' : 's'}.`,
        link: '/staff/price-requests',
        entity: 'PriceRequest',
        entityId: first.id,
      }),
    )
  }

  revalidatePath('/staff/price-requests')
  revalidatePath('/products')
  revalidatePath('/products/instruments')
  revalidatePath('/products/consumables')
  revalidatePath('/products/spare-parts')

  const summary =
    [quotedCount ? `${quotedCount} price${quotedCount === 1 ? '' : 's'} confirmed` : '', askedCount ? `${askedCount} awaiting details` : '']
      .filter(Boolean)
      .join(', ') || 'Updated'
  if (!to) return { ok: true, emailed: false, warning: `${summary} - but this client has no email on file, so nothing was sent. Contact them another way.` }
  if (!emailed) return { ok: true, emailed: false, warning: `${summary}, but the email to ${to} could not be sent. Check the email log.` }
  return { ok: true, emailed: true }
}
