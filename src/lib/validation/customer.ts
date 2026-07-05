import { z } from 'zod'

const opt = (max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required').max(120),
  designation: opt(120),
  email: z
    .string()
    .trim()
    .max(200)
    .email('Invalid email')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  phone: opt(40),
  isPrimary: z.boolean().optional().default(false),
})

export type ContactInput = z.infer<typeof contactSchema>

export const customerSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(200),
  country: z.string().trim().min(2, 'Country is required').max(80),
  city: opt(120),
  address: opt(400),
  trn: opt(60),
  tradeLicense: opt(80),
  industry: opt(120),
  paymentTerms: opt(120),
  creditLimit: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      if (!v) return undefined
      const n = Number(v)
      return Number.isFinite(n) && n >= 0 ? n : undefined
    }),
  currency: z.string().trim().max(8).optional().or(z.literal('')).transform((v) => v || 'AED'),
  phone: opt(40),
  email: z
    .string()
    .trim()
    .max(200)
    .email('Invalid email')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  website: opt(300),
  notes: opt(3000),
  salesPersonId: opt(40),
})

export type CustomerInput = z.infer<typeof customerSchema>

/** Parse the JSON blob of contact rows the form submits into validated contacts. */
export function parseContacts(json: string | null | undefined): ContactInput[] {
  if (!json) return []
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  const out: ContactInput[] = []
  for (const row of raw) {
    const parsed = contactSchema.safeParse(row)
    if (parsed.success && parsed.data.name) out.push(parsed.data)
  }
  return out
}

// Common industry options for the select (free text also allowed via "Other").
export const INDUSTRY_OPTIONS = [
  'Petroleum & Petrochemical',
  'Oil & Gas',
  'Pharmaceutical',
  'Food & Beverage',
  'Water & Environment',
  'Cement & Construction',
  'Metals & Mining',
  'Academic & Research',
  'Government & Testing Labs',
  'Paints & Coatings',
  'Other',
] as const

export const PAYMENT_TERMS_OPTIONS = [
  'Advance (100%)',
  '50% advance, 50% on delivery',
  '30 days net',
  '45 days net',
  '60 days net',
  'Against delivery',
] as const
