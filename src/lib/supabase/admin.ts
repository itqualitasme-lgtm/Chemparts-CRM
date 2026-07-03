import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/env'

/** Service-role client — bypasses RLS. Server-side only, never expose. */
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
