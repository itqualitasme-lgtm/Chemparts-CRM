import { createBrowserClient } from '@supabase/ssr'

// NEXT_PUBLIC_* references must stay literal so Next.js can inline them in
// client bundles; Chemparts_* variants come from the Supabase↔Vercel integration.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_Chemparts_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_Chemparts_SUPABASE_ANON_KEY!,
  )
}
