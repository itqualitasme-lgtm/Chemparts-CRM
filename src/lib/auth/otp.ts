import 'server-only'
import { createHash, randomInt } from 'node:crypto'
import { db } from '@/lib/db'
import { sendMail } from '@/lib/mail/send'

const OTP_TTL_MS = 10 * 60 * 1000

/** SHA-256 of a code — we never store the plain code. */
export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * Generate a 6-digit code, store its hash (10-min TTL, one active per email) and
 * email it via our own Zoho SMTP. Used by both login and registration so the
 * customer always receives a numeric CODE, never a magic link.
 */
export async function issueOtpCode(email: string): Promise<boolean> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)
  await db.emailOtp.upsert({
    where: { email },
    create: { email, codeHash: hashCode(code), expiresAt },
    update: { codeHash: hashCode(code), expiresAt, attempts: 0, consumed: false, createdAt: new Date() },
  })
  try {
    await sendMail(email, 'otp-code', { code })
    return true
  } catch {
    return false
  }
}
