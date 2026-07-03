import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { databaseUrl } from '@/lib/env'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  // App queries go through the Supavisor pooled connection (port 6543).
  const adapter = new PrismaPg({ connectionString: databaseUrl() })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
