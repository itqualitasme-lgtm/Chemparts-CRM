import { PrismaPg } from '@prisma/adapter-pg'
import { databaseUrl } from './env'

// Supabase's Supavisor pooler terminates TLS with a self-signed certificate
// chain. Newer pg treats sslmode=require as verify-full, which rejects it, so
// we disable chain verification (traffic is still encrypted).
export function createPgAdapter() {
  return new PrismaPg({
    connectionString: databaseUrl(),
    ssl: { rejectUnauthorized: false },
  })
}
