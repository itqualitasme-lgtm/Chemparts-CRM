'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { issueOtpCode } from '@/lib/auth/otp'
import { registerSchema } from '@/lib/validation/register'
import { CUSTOMER_PORTAL_ENABLED, MAINTENANCE_MESSAGE } from '@/lib/auth/portal-access'

export type RegisterState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  ok?: boolean
  email?: string
}

// Create a customer account WITHOUT Supabase's confirmation-link email. The
// account is created directly, then we email a numeric OTP code (via Zoho) which
// the register page verifies to sign the customer in — no magic link, no
// localhost redirect.
export async function registerCustomer(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  // Maintenance: customer registration is closed for now.
  if (!CUSTOMER_PORTAL_ENABLED) return { error: MAINTENANCE_MESSAGE }
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { fieldErrors: flat.fieldErrors as Record<string, string[]> }
  }
  const input = parsed.data
  const email = input.email.trim().toLowerCase()

  // No password at sign-up — the customer verifies by emailed code and can set a
  // password later from Account → Settings. Supabase allows a passwordless user.
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  })
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return { error: 'An account with that email already exists — please sign in instead.' }
    }
    return { error: 'Sign-up failed, please try again.' }
  }
  const userId = data.user?.id
  if (!userId) return { error: 'Sign-up failed, please try again.' }

  const existing = await db.profile.findUnique({ where: { id: userId } })
  if (!existing) {
    const customer = await db.customer.create({
      data: { companyName: input.companyName, country: input.country, source: 'SELF' },
    })
    await db.profile.create({
      data: {
        id: userId,
        email,
        fullName: input.fullName,
        phone: input.phone,
        role: 'CUSTOMER',
        customerId: customer.id,
      },
    })
  }

  await issueOtpCode(email)
  return { ok: true, email }
}

// Resend the verification code (used by the register page's "resend" link).
export async function resendRegisterCode(email: string): Promise<{ ok?: boolean; error?: string }> {
  const clean = email.trim().toLowerCase()
  const profile = await db.profile.findUnique({ where: { email: clean } })
  if (!profile) return { error: 'No account found for that email.' }
  const sent = await issueOtpCode(clean)
  return sent ? { ok: true } : { error: 'Could not resend the code. Try again shortly.' }
}
