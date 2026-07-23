import 'server-only'
import { sendMail } from './send'

// Central notification helper. Best-effort: validates the address, supports a CC
// (e.g. the assigned sales person), and NEVER throws — a failed notification must
// not break the enquiry/order that triggered it. sendMail already logs to EmailLog.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Where staff notifications for new enquiries/requests are sent. */
export const INFO_INBOX = process.env.NOTIFY_INBOX || 'info@chemparts-me.com'

function valid(email: string | null | undefined): email is string {
  return !!email && EMAIL_RE.test(email)
}

/** Send one notification, swallowing any error. Returns whether it was sent. */
export async function notify(
  to: string | null | undefined,
  template: string,
  vars: Record<string, string>,
  opts?: { cc?: string | null; replyTo?: string | null },
): Promise<boolean> {
  if (!valid(to)) return false
  const cc = valid(opts?.cc) && opts?.cc !== to ? opts?.cc : undefined
  const replyTo = valid(opts?.replyTo) ? opts?.replyTo : undefined
  try {
    await sendMail(to, template, vars, { cc, replyTo })
    return true
  } catch {
    // swallowed — sendMail already recorded a FAILED EmailLog row.
    return false
  }
}

/** Notify the staff info inbox (optionally CC the assigned sales person). */
export async function notifyStaff(
  template: string,
  vars: Record<string, string>,
  opts?: { cc?: string | null },
): Promise<void> {
  await notify(INFO_INBOX, template, vars, opts)
}
