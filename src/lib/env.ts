// Server-side env access. The Supabase↔Vercel marketplace integration injects
// variables prefixed "Chemparts_" (marked sensitive, so they can't be renamed
// or pulled); we fall back to those names when the canonical ones are absent.
// Values are trimmed: env vars added via shell pipes can carry a stray \r\n.

export function env(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return ''
}

export function supabaseUrl(): string {
  return env('NEXT_PUBLIC_SUPABASE_URL', 'Chemparts_SUPABASE_URL')
}

export function supabaseAnonKey(): string {
  return env('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Chemparts_SUPABASE_ANON_KEY')
}

export function supabaseServiceRoleKey(): string {
  return env('SUPABASE_SERVICE_ROLE_KEY', 'Chemparts_SUPABASE_SERVICE_ROLE_KEY')
}

export function databaseUrl(): string {
  return env('DATABASE_URL', 'Chemparts_POSTGRES_PRISMA_URL')
}

export function directDatabaseUrl(): string {
  return env('DIRECT_URL', 'Chemparts_POSTGRES_URL_NON_POOLING')
}

export function appUrl(): string {
  const explicit = env('NEXT_PUBLIC_APP_URL')
  if (explicit) return explicit
  const vercelUrl = env('VERCEL_URL')
  return vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000'
}
