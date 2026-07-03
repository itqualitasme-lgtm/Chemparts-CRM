import 'server-only'
import { cookies } from 'next/headers'

// A fresh OTP verification lets a customer change their password without
// re-verifying, for this many minutes.
export const OTP_GRACE_MINUTES = 30
const OTP_GRACE_COOKIE = 'cp_otp_at'

export async function markOtpVerified() {
  const c = await cookies()
  c.set(OTP_GRACE_COOKIE, Date.now().toString(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: OTP_GRACE_MINUTES * 60,
    path: '/',
  })
}

export async function isOtpGraceActive(): Promise<boolean> {
  const c = await cookies()
  const v = c.get(OTP_GRACE_COOKIE)?.value
  if (!v) return false
  const t = Number(v)
  if (!Number.isFinite(t)) return false
  return Date.now() - t < OTP_GRACE_MINUTES * 60 * 1000
}
