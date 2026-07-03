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

// Step 1 of OTP sign-in: email a one-time code to an EXISTING account.
export async function requestOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Enter your email.' }

  // Only allow OTP for accounts that already exist (OTP is not a signup path).
  const profile = await db.profile.findUnique({ where: { email } })
  if (!profile) return { error: 'No account found for that email.' }
  if (profile.status !== 'ACTIVE') return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  // One-time email codes are a customer convenience only. Staff/vendor/manager
  // accounts must use a password (higher-assurance) or contact the IT admin.
  if (profile.role !== 'CUSTOMER') {
    return {
      error:
        'One-time codes are for customers only. Staff and vendors: sign in with your password, or contact it.admin@chemparts-me.com.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  if (error) return { error: 'Could not send a code right now. Try again shortly.' }
  return { sent: true, email }
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

  const profile = await db.profile.findUnique({ where: { id: data.user.id } })
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
