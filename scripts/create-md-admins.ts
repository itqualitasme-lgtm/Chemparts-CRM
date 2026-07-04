import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient, type Role } from '../src/generated/prisma/client'
import { supabaseServiceRoleKey, supabaseUrl } from '../src/lib/env'
import { createPgAdapter } from '../src/lib/pg'

// One-off: create the two MD administrator accounts (shaji@, sheeja@).
// Passwords are generated here and printed once — hand them over and have each
// person change it after first login. Re-running is safe: existing users keep
// their password (only the role/name is re-asserted) and no new password prints.

const db = new PrismaClient({ adapter: createPgAdapter() })
const admin = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Readable-but-strong temp password, e.g. "Chemparts-7Kq2-Wn9P". */
function tempPassword(): string {
  const chunk = () => randomBytes(3).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)
  return `Chemparts-${chunk()}-${chunk()}`
}

async function ensureAdmin(email: string, fullName: string, role: Role) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers()
  if (listError) throw listError
  const existing = list.users.find((u) => u.email === email)

  if (existing) {
    await db.profile.upsert({
      where: { id: existing.id },
      create: { id: existing.id, email, fullName, role },
      update: { role, fullName },
    })
    console.log(`EXISTS  ${role}  ${email}  (${fullName}) — password unchanged`)
    return
  }

  const password = tempPassword()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error
  await db.profile.upsert({
    where: { id: data.user!.id },
    create: { id: data.user!.id, email, fullName, role },
    update: { role, fullName },
  })
  console.log(`CREATED ${role}  ${email}  (${fullName})`)
  console.log(`        temp password: ${password}`)
}

async function main() {
  await ensureAdmin('shaji@chemparts-me.com', 'Shaji', 'ADMIN')
  await ensureAdmin('sheeja@chemparts-me.com', 'Sheeja (MD)', 'ADMIN')
  console.log('\nDone. Share each temp password privately; ask them to change it after first login.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
