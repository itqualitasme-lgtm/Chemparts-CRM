'use server'

import { randomBytes } from 'node:crypto'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { hashCode, issueOtpCode } from '@/lib/auth/otp'
import { canAccessPortal, homePathFor, portalFromPath } from '@/lib/auth/rbac'
import { markOtpVerified } from '@/lib/auth/otp-grace'
import { CUSTOMER_PORTAL_ENABLED, MAINTENANCE_MESSAGE, isStaffRole } from '@/lib/auth/portal-access'

export type LoginState = { error?: string }

// One universal login for every account type. After authenticating we route the
// user to their own portal by role — customers self-register, everyone else is
// created by an admin, but they all sign in here.
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '').trim()
  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid email or password.' }

  const profile = await db.profile.findUnique({ where: { id: data.user.id } })
  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut()
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }

  // Maintenance: only Chemparts staff may sign in for now.
  if (!CUSTOMER_PORTAL_ENABLED && !isStaffRole(profile.role)) {
    await supabase.auth.signOut()
    return { error: MAINTENANCE_MESSAGE }
  }

  // Honour a ?next= target only if this user's role may access it.
  const nextPortal = next ? portalFromPath(next) : null
  if (next && nextPortal && canAccessPortal(profile.role, nextPortal)) {
    redirect(next)
  }
  redirect(homePathFor(profile.role))
}

export type OtpState = { error?: string; sent?: boolean; email?: string }

const STAFF_DOMAIN = 'chemparts-me.com'

/** True if the email is on the company domain (case-insensitive). */
function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${STAFF_DOMAIN}`)
}

// Step 1 of OTP sign-in. Works for any existing account (customer or staff);
// a company-domain email with no account is auto-provisioned as STAFF on verify.
// We generate our OWN 6-digit code, store its hash, and email it via Zoho — so
// customers get a numeric CODE from noreply@chemparts-me.com, independent of any
// Supabase email template or Site URL setting.
export async function requestOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Enter your email.' }

  const profile = await db.profile.findUnique({ where: { email } })
  if (profile && profile.status !== 'ACTIVE') {
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }

  // Maintenance: only Chemparts staff may sign in for now. A company-domain email
  // (or an existing staff/admin account) is allowed; everyone else sees the notice.
  const staffEligible = isCompanyEmail(email) || (profile != null && isStaffRole(profile.role))
  if (!CUSTOMER_PORTAL_ENABLED && !staffEligible) {
    return { error: MAINTENANCE_MESSAGE }
  }

  const autoProvision = !profile && isCompanyEmail(email)
  if (!profile && !autoProvision) {
    return { error: 'No account found for that email. Customers can register for an account.' }
  }

  // Company first-timer: ensure a confirmed auth user exists (STAFF profile is
  // created on verify).
  if (autoProvision) {
    const { error: createErr } = await createAdminClient().auth.admin.createUser({
      email,
      email_confirm: true,
      password: randomBytes(24).toString('base64url'),
    })
    if (createErr && !/already|registered|exists/i.test(createErr.message)) {
      return { error: 'Could not start sign-in. Try again shortly.' }
    }
  }

  const sent = await issueOtpCode(email)
  if (!sent) return { error: 'Could not send the code email. Try again shortly.' }
  return { sent: true, email }
}

/** Turn an email local part into a readable name, e.g. "shaji.k" → "Shaji K". */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ') || 'Chemparts Staff'
  )
}

// Step 2 of OTP sign-in: verify the code and route by role.
export async function verifyOtp(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const token = String(formData.get('token') ?? '').trim()
  const next = String(formData.get('next') ?? '').trim()
  if (!email || !token) return { error: 'Enter the code we emailed you.' }

  // 1) Verify OUR emailed code.
  const otp = await db.emailOtp.findUnique({ where: { email } })
  if (!otp || otp.consumed || otp.expiresAt < new Date()) return { error: 'Invalid or expired code. Request a new one.' }
  if (otp.attempts >= 6) return { error: 'Too many attempts. Request a new code.' }
  if (hashCode(token) !== otp.codeHash) {
    await db.emailOtp.update({ where: { email }, data: { attempts: { increment: 1 } } })
    return { error: 'Incorrect code. Check the email and try again.' }
  }
  await db.emailOtp.update({ where: { email }, data: { consumed: true } })

  // 2) Establish a Supabase session from a fresh magic-link token (token_hash).
  const admin = createAdminClient()
  const supabase = await createClient()
  async function mintSession(): Promise<{ userId?: string; error?: boolean }> {
    for (const type of ['email', 'magiclink'] as const) {
      const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
      const hashed = link?.properties?.hashed_token
      if (!hashed) continue
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: hashed, type })
      if (!error && data.user) return { userId: data.user.id }
    }
    return { error: true }
  }
  const session = await mintSession()
  if (session.error || !session.userId) return { error: 'Could not complete sign-in. Try again.' }

  let profile = await db.profile.findUnique({ where: { id: session.userId } })

  // Auto-provision: a verified company-domain user with no profile becomes STAFF.
  if (!profile && isCompanyEmail(email)) {
    profile = await db.profile.create({
      data: {
        id: session.userId,
        email,
        fullName: nameFromEmail(email),
        role: 'STAFF',
        status: 'ACTIVE',
      },
    })
    await db.auditLog.create({
      data: { actorId: session.userId, action: 'CREATE', entity: 'Profile', entityId: session.userId, detail: { via: 'otp-auto-provision', role: 'STAFF' } },
    })
  }

  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut()
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }

  // Maintenance: only Chemparts staff may sign in for now.
  if (!CUSTOMER_PORTAL_ENABLED && !isStaffRole(profile.role)) {
    await supabase.auth.signOut()
    return { error: MAINTENANCE_MESSAGE }
  }

  // Mark a fresh OTP verification so the customer can change their password
  // within the grace window without re-verifying.
  await markOtpVerified()

  const nextPortal = next ? portalFromPath(next) : null
  if (next && nextPortal && canAccessPortal(profile.role, nextPortal)) {
    redirect(next)
  }
  redirect(homePathFor(profile.role))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
