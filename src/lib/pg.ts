import { PrismaPg } from '@prisma/adapter-pg'
import { databaseUrl } from './env'

// Supabase's Supavisor pooler terminates TLS with a self-signed certificate
// chain. Newer pg treats `sslmode=require` (what Supabase's URL ships with) as
// `verify-full`, which rejects that chain. `sslmode=no-verify` keeps the
// connection encrypted but skips chain verification. We rewrite the URL so the
// connection string is authoritative — passing an `ssl` object alongside a
// string that still says `sslmode=require` gets overridden and ignored.
export function withNoVerifySsl(connectionString: string): string {
  const url = new URL(connectionString)
  url.searchParams.delete('sslmode')
  url.searchParams.delete('uselibpqcompat')
  url.searchParams.set('sslmode', 'no-verify')
  return url.toString()
}

export function createPgAdapter() {
  return new PrismaPg({
    connectionString: withNoVerifySsl(databaseUrl()),
    ssl: { rejectUnauthorized: false },
  })
}
