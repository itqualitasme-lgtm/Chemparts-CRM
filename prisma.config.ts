import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Migrations/db-push use the direct (non-pooled) connection; the app itself
// connects through the Supavisor pooler via the driver adapter in src/lib/db.ts.
// Chemparts_* names come from the Supabase↔Vercel marketplace integration.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.Chemparts_POSTGRES_URL_NON_POOLING ?? '',
  },
})
