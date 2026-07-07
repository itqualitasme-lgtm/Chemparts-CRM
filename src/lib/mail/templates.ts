const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1a2733">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#0A2540;padding:20px 32px"><span style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:2px">CHEMPARTS</span>
<span style="color:#9fb3c8;font-size:11px;letter-spacing:1px"> MIDDLE EAST</span></td></tr>
<tr><td style="padding:32px"><h2 style="margin:0 0 16px;font-size:18px;color:#0A2540">${title}</h2>${bodyHtml}</td></tr>
<tr><td style="background:#f4f6f8;padding:16px 32px;font-size:11px;color:#66788a">
Chemparts Middle East FZC &middot; SAIF Zone, Sharjah, UAE &middot; chemparts-me.com<br>
This is an automated no-reply message. For assistance email info@chemparts-me.com.</td></tr>
</table></td></tr></table></body></html>`
}

const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#0A2540;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none">${label}</a></p>`

type TemplateVars = Record<string, string>
type Rendered = { subject: string; html: string }

const templates: Record<string, (v: TemplateVars) => Rendered> = {
  welcome: (v) => ({
    subject: 'Welcome to Chemparts — your account is ready',
    html: layout(
      'Welcome to Chemparts',
      `<p>Dear ${esc(v.name)},</p>
<p>Your Chemparts customer account is active. Browse our store, send enquiries and track your orders online.</p>
${button(v.portalUrl, 'Open my account')}`,
    ),
  }),
  'staff-invite': (v) => ({
    subject: 'Your Chemparts staff account',
    html: layout(
      'Staff account created',
      `<p>Dear ${esc(v.name)},</p>
<p>An account has been created for you on the Chemparts portal. Set your password to get started:</p>
${button(v.actionUrl, 'Set password')}`,
    ),
  }),
  'vendor-invite': (v) => ({
    subject: 'Chemparts vendor portal invitation',
    html: layout(
      'Vendor portal invitation',
      `<p>Dear ${esc(v.name)},</p>
<p>${esc(v.company)} has been registered as a vendor of Chemparts Middle East. Use the vendor portal to view purchase orders and submit bills.</p>
${button(v.actionUrl, 'Activate account')}`,
    ),
  }),
  'enquiry-received': (v) => ({
    subject: `Enquiry ${v.enquiryNo} received — Chemparts`,
    html: layout(
      'Thanks — we have your enquiry',
      `<p>Dear ${esc(v.name)},</p>
<p>We've received your enquiry <strong>${esc(v.enquiryNo)}</strong> with ${esc(v.itemCount)} item${
        v.itemCount === '1' ? '' : 's'
      }. Our team will reply with pricing and availability, usually within the working day.</p>
<p style="color:#66788a;font-size:13px">Please quote ${esc(v.enquiryNo)} in any follow-up.</p>`,
    ),
  }),
  'service-received': (v) => ({
    subject: `Service request ${v.requestNo} received — Chemparts`,
    html: layout(
      'We’ve got your service request',
      `<p>Dear ${esc(v.name)},</p>
<p>Thanks — your service request <strong>${esc(v.requestNo)}</strong> has been logged. Our service team will get back to you with next steps, usually within the working day.</p>
<p style="color:#66788a;font-size:13px">Please quote ${esc(v.requestNo)} in any follow-up.</p>`,
    ),
  }),
  'contact-received': (v) => ({
    subject: `We’ve got your message — Chemparts (${v.enquiryNo})`,
    html: layout(
      'Thanks — we have your message',
      `<p>Dear ${esc(v.name)},</p>
<p>Thanks for reaching out. We’ve logged your message as <strong>${esc(v.enquiryNo)}</strong> and our team will reply, usually within the working day.</p>
<p style="color:#66788a;font-size:13px">Please quote ${esc(v.enquiryNo)} in any follow-up.</p>`,
    ),
  }),
  // ---- Staff notifications (to the info inbox, cc sales person) ----
  'staff-new-enquiry': (v) => ({
    subject: `New enquiry ${v.enquiryNo} — ${v.who}`,
    html: layout(
      'New enquiry received',
      `<p><strong>${esc(v.enquiryNo)}</strong> from <strong>${esc(v.who)}</strong> via ${esc(v.channel)}.</p>
${v.summary ? `<p style="color:#66788a">${esc(v.summary)}</p>` : ''}
${button(v.link, 'Open in portal')}`,
    ),
  }),
  'staff-new-service': (v) => ({
    subject: `New service request ${v.requestNo} — ${v.type}`,
    html: layout(
      'New service request',
      `<p><strong>${esc(v.requestNo)}</strong> (${esc(v.type)}) from <strong>${esc(v.who)}</strong>.</p>
${v.equipment ? `<p style="color:#66788a">Equipment: ${esc(v.equipment)}</p>` : ''}
${button(v.link, 'Open in portal')}`,
    ),
  }),
  'staff-new-price-request': (v) => ({
    subject: `New price request — ${v.product}`,
    html: layout(
      'New price request',
      `<p><strong>${esc(v.who)}</strong> asked for the current price of <strong>${esc(v.product)}</strong> (qty ${esc(v.qty)}).</p>
${button(v.link, 'Open in portal')}`,
    ),
  }),
  // ---- Customer notifications ----
  'price-request-received': (v) => ({
    subject: `We've got your price request — Chemparts`,
    html: layout(
      'Thanks — we have your request',
      `<p>Dear ${esc(v.name)},</p>
<p>We've received your request for the current price of <strong>${esc(v.product)}</strong>. Our team will confirm pricing and availability, usually within the working day.</p>`,
    ),
  }),
  'campaign': (v) => ({
    subject: v.subject,
    html: layout(
      v.subject,
      v.body
        .split(/\n\n+/)
        .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
        .join('') +
        `<p style="color:#66788a;font-size:12px;margin-top:28px;border-top:1px solid #e6e9ee;padding-top:14px">You're receiving this because you subscribed to Chemparts updates. <a href="${esc(v.unsubscribeUrl)}" style="color:#66788a">Unsubscribe</a>.</p>`,
    ),
  }),
  'newsletter-welcome': (v) => ({
    subject: `You're subscribed — Chemparts updates & offers`,
    html: layout(
      'Welcome to Chemparts updates',
      `<p>Dear ${esc(v.name)},</p>
<p>Thanks for subscribing. You'll now receive Chemparts product news, promotions and offers on analytical instruments, spares and lab consumables.</p>
<p style="color:#66788a;font-size:13px;margin-top:20px">Not interested? <a href="${esc(v.unsubscribeUrl)}" style="color:#66788a">Unsubscribe here</a>.</p>`,
    ),
  }),
  'price-confirmed': (v) => ({
    subject: `Your price for ${v.product} — Chemparts`,
    html: layout(
      'Your price is confirmed',
      `<p>Dear ${esc(v.name)},</p>
<p>The current price for <strong>${esc(v.product)}</strong> is:</p>
<p style="font-size:22px;font-weight:bold;color:#0A2540;margin:12px 0">${esc(v.price)}</p>
${v.validUntil ? `<p style="color:#66788a">Valid until ${esc(v.validUntil)}.</p>` : ''}
<p>Reply to this enquiry or contact us to place an order.</p>`,
    ),
  }),
  'enquiry-status-update': (v) => ({
    subject: `Update on your enquiry ${v.enquiryNo} — Chemparts`,
    html: layout(
      'Your enquiry has an update',
      `<p>Dear ${esc(v.name)},</p>
<p>Your enquiry <strong>${esc(v.enquiryNo)}</strong> is now marked <strong>${esc(v.status)}</strong>. Our team will be in touch with next steps.</p>`,
    ),
  }),
  'quotation-sent': (v) => ({
    subject: `Your quotation ${v.quotationNo} is ready — Chemparts`,
    html: layout(
      'Your quotation is ready',
      `<p>Dear ${esc(v.name)},</p>
<p>Your quotation <strong>${esc(v.quotationNo)}</strong> is ready to view online.</p>
${button(v.link, 'View quotation')}
<p style="color:#66788a;font-size:13px">Please quote ${esc(v.quotationNo)} in any follow-up.</p>`,
    ),
  }),
  'order-status-update': (v) => ({
    subject: `Update on your order ${v.orderNo} — Chemparts`,
    html: layout(
      'Your order has an update',
      `<p>Dear ${esc(v.name)},</p>
<p>Your order <strong>${esc(v.orderNo)}</strong> is now <strong>${esc(v.status)}</strong>.</p>`,
    ),
  }),
  'service-status-update': (v) => ({
    subject: `Update on your service request ${v.requestNo} — Chemparts`,
    html: layout(
      'Your service request has an update',
      `<p>Dear ${esc(v.name)},</p>
<p>Your service request <strong>${esc(v.requestNo)}</strong> is now <strong>${esc(v.status)}</strong>. Our service team will follow up.</p>`,
    ),
  }),
  'otp-code': (v) => ({
    subject: `Your Chemparts sign-in code`,
    html: layout(
      'Your sign-in code',
      `<p>Use this code to sign in to Chemparts. It expires in 10 minutes.</p>
<p style="font-size:34px;font-weight:bold;letter-spacing:10px;color:#0A2540;margin:20px 0">${esc(v.code)}</p>
<p style="color:#66788a;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`,
    ),
  }),
}

export function renderEmail(template: string, vars: TemplateVars): Rendered {
  const fn = templates[template]
  if (!fn) throw new Error(`Unknown email template: ${template}`)
  return fn(vars)
}
