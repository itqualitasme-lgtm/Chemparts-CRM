'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, portalFromPath } from '@/lib/auth/rbac'
import { markOtpVerified } from '@/lib/auth/otp-grace'

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

// Step 1 of OTP sign-in. OTP works for any existing account (customer or staff).
// Additionally, a company-domain email with no account yet is allowed through so
// it can be auto-provisioned as STAFF on verify — no manual registration needed.
export async function requestOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Enter your email.' }

  const profile = await db.profile.findUnique({ where: { email } })
  if (profile && profile.status !== 'ACTIVE') {
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }
  // No account: only company-domain emails may self-provision via OTP.
  const autoProvision = !profile && isCompanyEmail(email)
  if (!profile && !autoProvision) {
    return { error: 'No account found for that email. Customers can register for an account.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Existing accounts never create; a company-domain first-timer does.
    options: { shouldCreateUser: autoProvision },
  })
  if (error) return { error: 'Could not send a code right now. Try again shortly.' }
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
  const email = String(formData.get('email') ?? '').trim()
  const token = String(formData.get('token') ?? '').trim()
  const next = String(formData.get('next') ?? '').trim()
  if (!email || !token) return { error: 'Enter the code we emailed you.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error || !data.user) return { error: 'Invalid or expired code.' }

  let profile = await db.profile.findUnique({ where: { id: data.user.id } })

  // Auto-provision: a verified company-domain user with no profile becomes STAFF.
  if (!profile && isCompanyEmail(email)) {
    profile = await db.profile.create({
      data: {
        id: data.user.id,
        email,
        fullName: nameFromEmail(email),
        role: 'STAFF',
        status: 'ACTIVE',
      },
    })
    await db.auditLog.create({
      data: { actorId: data.user.id, action: 'CREATE', entity: 'Profile', entityId: data.user.id, detail: { via: 'otp-auto-provision', role: 'STAFF' } },
    })
  }

  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut()
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
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
