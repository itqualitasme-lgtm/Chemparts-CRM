import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient, type Role } from '../src/generated/prisma/client'
import { env, supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { createPgAdapter } from '../src/lib/pg'

const db = new PrismaClient({ adapter: createPgAdapter() })

const admin = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser(email: string, password: string, fullName: string, role: Role) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers()
  if (listError) throw listError
  let user = list.users.find((u) => u.email === email)
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw error
    user = data.user
  }
  await db.profile.upsert({
    where: { id: user!.id },
    create: { id: user!.id, email, fullName, role },
    update: { role, fullName },
  })
  console.log(`OK ${role} ${email} (${fullName})`)
}

async function main() {
  // Super admin — the primary IT/administrator account.
  const superEmail = env('SUPER_ADMIN_EMAIL') || 'it.admin@chemparts-me.com'
  const superName = env('SUPER_ADMIN_NAME') || 'System Administrator'
  const superPassword = env('SUPER_ADMIN_PASSWORD')
  if (!superPassword) throw new Error('SUPER_ADMIN_PASSWORD not set')
  await ensureUser(superEmail, superPassword, superName, 'ADMIN')

  // Optional secondary admin from ADMIN_SEED_* (kept for the original owner login).
  const adminEmail = env('ADMIN_SEED_EMAIL')
  const adminPassword = env('ADMIN_SEED_PASSWORD')
  if (adminEmail && adminPassword) {
    await ensureUser(adminEmail, adminPassword, 'Razin Ahmed', 'ADMIN')
  }

  await ensureUser('staff.demo@chemparts-me.com', 'Demo-staff-123', 'Demo Staff', 'STAFF')

  await db.setting.upsert({
    where: { key: 'company' },
    create: {
      key: 'company',
      value: { defaultCurrency: 'AED', currencies: ['AED', 'USD', 'QAR', 'EUR'], vatPercent: 5 },
    },
    update: {},
  })
  console.log('Seed complete')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
