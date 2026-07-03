'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { appUrl } from '@/lib/env'
import { registerSchema } from '@/lib/validation/register'

export type RegisterState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  ok?: boolean
}

export async function registerCustomer(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return { fieldErrors: flat.fieldErrors as Record<string, string[]> }
  }
  const input = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${appUrl()}/auth/callback?next=/account`,
      data: { full_name: input.fullName },
    },
  })
  if (error) return { error: error.message }
  const userId = data.user?.id
  if (!userId) return { error: 'Sign-up failed, please try again.' }

  const existing = await db.profile.findUnique({ where: { id: userId } })
  if (!existing) {
    const customer = await db.customer.create({
      data: {
        companyName: input.companyName,
        country: input.country,
        source: 'SELF',
      },
    })
    await db.profile.create({
      data: {
        id: userId,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone,
        role: 'CUSTOMER',
        customerId: customer.id,
      },
    })
  }
  return { ok: true }
}
