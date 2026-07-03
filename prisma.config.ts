import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Migrations use the direct (non-pooled) connection; the app itself connects
// through the Supavisor pooler via the driver adapter in src/lib/db.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL ?? '',
  },
})
