import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Role } from '../src/generated/prisma/client'
import { databaseUrl, supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl() }),
})

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
    update: { role },
  })
  console.log(`OK ${role} ${email}`)
}

async function main() {
  await ensureUser(
    process.env.ADMIN_SEED_EMAIL!,
    process.env.ADMIN_SEED_PASSWORD!,
    'Razin Ahmed',
    'ADMIN',
  )
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
