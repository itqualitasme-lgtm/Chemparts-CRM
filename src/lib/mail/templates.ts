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
  'otp-code': (v) => ({
    subject: `${v.code} is your Chemparts sign-in code`,
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
