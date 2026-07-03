'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, portalFromPath } from '@/lib/auth/rbac'

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

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
