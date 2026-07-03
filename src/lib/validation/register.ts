import { z } from 'zod'

// Free/personal email providers rejected for customer self-registration —
// customers must use an official company address.
export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mail.com',
  'gmx.com',
  'protonmail.com',
  'proton.me',
  'yandex.com',
  'zoho.com',
])

export function isOfficialEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1]
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain)
}

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name'),
  companyName: z.string().trim().min(2, 'Enter your company name'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email')
    .refine(isOfficialEmail, 'Please use your official company email (not a personal Gmail/Yahoo/Hotmail address).'),
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Include country code, e.g. +971...'),
  country: z.string().length(2, 'Select your country'),
  password: z.string().min(10, 'At least 10 characters'),
  agreeTerms: z
    .string()
    .optional()
    .refine((v) => v === 'yes', { message: 'Please accept the Terms & Conditions to continue.' }),
})

export type RegisterInput = z.infer<typeof registerSchema>
