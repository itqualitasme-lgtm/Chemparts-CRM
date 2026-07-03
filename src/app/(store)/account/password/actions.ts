'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'
import { isOtpGraceActive, markOtpVerified } from '@/lib/auth/otp-grace'

export type PwState = { error?: string; ok?: boolean }
export type OtpStepState = { error?: string; sent?: boolean; verified?: boolean }

// This flow is a customer convenience only.
async function requireCustomer() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.role !== 'CUSTOMER') redirect('/')
  return user
}

export async function sendPasswordOtp(_prev: OtpStepState): Promise<OtpStepState> {
  const user = await requireCustomer()
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  })
  if (error) return { error: 'Could not send a code right now. Try again shortly.' }
  return { sent: true }
}

export async function confirmPasswordOtp(_prev: OtpStepState, formData: FormData): Promise<OtpStepState> {
  const user = await requireCustomer()
  const token = String(formData.get('token') ?? '').trim()
  if (!token) return { error: 'Enter the code we emailed you.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email: user.email, token, type: 'email' })
  if (error) return { error: 'Invalid or expired code.' }
  await markOtpVerified()
  return { verified: true }
}

export async function changePassword(_prev: PwState, formData: FormData): Promise<PwState> {
  await requireCustomer()
  // No current password required — but a fresh OTP verification must be present.
  if (!(await isOtpGraceActive())) {
    return { error: 'Please verify with a one-time code first.' }
  }
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < 10) return { error: 'Password must be at least 10 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Could not update your password. Try again.' }
  return { ok: true }
}
