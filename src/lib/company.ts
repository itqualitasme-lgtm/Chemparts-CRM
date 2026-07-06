import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'

// Company branches / legal entities the business issues documents under.
// Chemparts trades as two entities; staff pick which one a quotation is issued
// under. Stored in the Setting table (key -> JSON) so no schema migration is
// needed to add or edit an entity.

export type CompanyBranch = {
  id: string
  name: string // trading name, shown large on the letterhead
  legal: string // legal entity line, shown in the footer (may equal name)
  tagline: string
  address: string // multi-line, free text
  phone: string
  email: string
  web: string
  trn: string // tax registration number (optional)
  isDefault: boolean
}

const BRANCHES_KEY = 'company.branches'

/** Seed entities (from the site footer). Staff can edit address/TRN in Settings. */
export const DEFAULT_BRANCHES: CompanyBranch[] = [
  {
    id: 'chemparts-fzc',
    name: 'Chemparts Middle East FZC',
    legal: 'Chemparts Middle East FZC',
    tagline: 'Analytical instruments · OEM spare parts · lab consumables · service & AMC',
    address: '',
    phone: '+971 6 5574047',
    email: 'info@chemparts-me.com',
    web: 'chemparts-me.com',
    trn: '',
    isDefault: true,
  },
  {
    id: 'chemparts-llc',
    name: 'Chemparts Medical & Laboratory Supplies LLC',
    legal: 'Chemparts Medical & Laboratory Supplies LLC',
    tagline: 'Analytical instruments · OEM spare parts · lab consumables · service & AMC',
    address: '',
    phone: '+971 6 5574047',
    email: 'info@chemparts-me.com',
    web: 'chemparts-me.com',
    trn: '',
    isDefault: false,
  },
]

function coerceBranch(raw: unknown, fallbackDefault: boolean): CompanyBranch | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name = typeof r.name === 'string' ? r.name.trim() : ''
  if (!name) return null
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  return {
    id: typeof r.id === 'string' && r.id ? r.id : randomUUID(),
    name,
    legal: str(r.legal).trim() || name,
    tagline: str(r.tagline).trim(),
    address: str(r.address),
    phone: str(r.phone).trim(),
    email: str(r.email).trim(),
    web: str(r.web).trim(),
    trn: str(r.trn).trim(),
    isDefault: typeof r.isDefault === 'boolean' ? r.isDefault : fallbackDefault,
  }
}

/** Read the configured company branches (falls back to the seed entities). */
export async function getCompanyBranches(): Promise<CompanyBranch[]> {
  const row = await db.setting.findUnique({ where: { key: BRANCHES_KEY } })
  const value = row?.value as { branches?: unknown } | null
  const raw = value?.branches
  if (Array.isArray(raw) && raw.length) {
    const clean = raw.map((b, i) => coerceBranch(b, i === 0)).filter((b): b is CompanyBranch => b !== null)
    if (clean.length) {
      // Guarantee exactly one default.
      if (!clean.some((b) => b.isDefault)) clean[0].isDefault = true
      return clean
    }
  }
  return DEFAULT_BRANCHES
}

/** Persist company branches; ensures exactly one is marked default. */
export async function saveCompanyBranches(branches: CompanyBranch[]): Promise<void> {
  const clean = branches
    .map((b, i) => coerceBranch(b, i === 0))
    .filter((b): b is CompanyBranch => b !== null)
    .slice(0, 12)
  if (!clean.length) return
  const firstDefault = clean.findIndex((b) => b.isDefault)
  clean.forEach((b, i) => (b.isDefault = i === (firstDefault === -1 ? 0 : firstDefault)))
  await db.setting.upsert({
    where: { key: BRANCHES_KEY },
    create: { key: BRANCHES_KEY, value: { branches: clean } },
    update: { value: { branches: clean } },
  })
}

/** Pick a branch by id, falling back to the default (or first) branch. */
export function resolveBranch(branches: CompanyBranch[], id: string | null | undefined): CompanyBranch {
  if (id) {
    const hit = branches.find((b) => b.id === id)
    if (hit) return hit
  }
  return branches.find((b) => b.isDefault) ?? branches[0] ?? DEFAULT_BRANCHES[0]
}
