'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, type Portal } from '@/lib/auth/rbac'

export type LoginState = { error?: string }

export async function login(portal: Portal, _prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid email or password.' }

  const profile = await db.profile.findUnique({ where: { id: data.user.id } })
  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut()
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }
  if (!canAccessPortal(profile.role, portal)) {
    await supabase.auth.signOut()
    return { error: 'This login page is not for your account type.' }
  }
  redirect(homePathFor(profile.role))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
