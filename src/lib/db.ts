import { PrismaClient } from '@/generated/prisma/client'
import { createPgAdapter } from '@/lib/pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  // App queries go through the Supavisor pooled connection (port 6543).
  return new PrismaClient({ adapter: createPgAdapter() })
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
