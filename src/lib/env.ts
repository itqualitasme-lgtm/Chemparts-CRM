// Server-side env access. The Supabase↔Vercel marketplace integration injects
// variables prefixed "Chemparts_" (marked sensitive, so they can't be renamed
// or pulled); we fall back to those names when the canonical ones are absent.

export function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.Chemparts_SUPABASE_URL ?? ''
}

export function supabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.Chemparts_SUPABASE_ANON_KEY ?? ''
  )
}

export function supabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.Chemparts_SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? process.env.Chemparts_POSTGRES_PRISMA_URL ?? ''
}

export function directDatabaseUrl(): string {
  return process.env.DIRECT_URL ?? process.env.Chemparts_POSTGRES_URL_NON_POOLING ?? ''
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}
