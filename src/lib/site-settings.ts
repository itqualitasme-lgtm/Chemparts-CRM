import 'server-only'
import { db } from '@/lib/db'

// Staff-editable site settings stored in the Setting table (key -> JSON value).

/** Default header ticker messages. "{count}" is replaced with the live
 *  instrument count at render time. */
export const DEFAULT_TICKER: string[] = [
  'AUTHORIZED PARTNER · Hitachi · Tanaka · Oxford Instruments · KEM',
  'WORLDWIDE SHIPPING · export-packed · insured · fully documented',
  '{count} ANALYTICAL INSTRUMENTS · 16 brand partners · in stock',
  'STANDARDS · ASTM · ISO · IP · referenced on every quote',
  'SAME WORKING-DAY RESPONSE · enquiries answered worldwide',
  'OEM SPARE PARTS · genuine parts · shipped worldwide',
  'TURNKEY LAB SOLUTIONS · design · install · calibrate · service',
  'ISO 9001 · 14001 · NABL traceable calibrations',
  'EXPORTS WORLDWIDE · handled with care · since 2003',
  'WHATSAPP +971 55 756 6123 · Get a quote in under 24 hours',
]

// ---------------------------------------------------------------------------
// Contact details — staff-editable, drive the header, footer and contact page.
// ---------------------------------------------------------------------------

export type ContactInfo = {
  phone: string
  email: string
  whatsapp: string // digits only, for wa.me links
  whatsappDisplay: string
  hours: string
}

export const DEFAULT_CONTACT: ContactInfo = {
  phone: '+971 6 5574047',
  email: 'info@chemparts-me.com',
  whatsapp: '971557566123',
  whatsappDisplay: '+971 55 756 6123',
  hours: 'Mon–Sat 8AM–5PM GST',
}

const CONTACT_KEY = 'site.contact'

/** Read the site contact details (falls back to defaults per field). */
export async function getContactInfo(): Promise<ContactInfo> {
  const row = await db.setting.findUnique({ where: { key: CONTACT_KEY } })
  const v = (row?.value ?? {}) as Partial<ContactInfo>
  const pick = (k: keyof ContactInfo) =>
    typeof v[k] === 'string' && (v[k] as string).trim() ? (v[k] as string).trim() : DEFAULT_CONTACT[k]
  return {
    phone: pick('phone'),
    email: pick('email'),
    whatsapp: pick('whatsapp'),
    whatsappDisplay: pick('whatsappDisplay'),
    hours: pick('hours'),
  }
}

/** Persist the site contact details. */
export async function saveContactInfo(info: ContactInfo): Promise<void> {
  await db.setting.upsert({
    where: { key: CONTACT_KEY },
    create: { key: CONTACT_KEY, value: info },
    update: { value: info },
  })
}

const TICKER_KEY = 'header.ticker'

/** Read the header ticker messages (falls back to defaults). */
export async function getTickerMessages(): Promise<string[]> {
  const row = await db.setting.findUnique({ where: { key: TICKER_KEY } })
  const value = row?.value as { messages?: unknown } | null
  const messages = value?.messages
  if (Array.isArray(messages)) {
    const clean = messages.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
    if (clean.length) return clean
  }
  return DEFAULT_TICKER
}

/** Persist header ticker messages (empty/blank lines dropped). */
export async function saveTickerMessages(messages: string[]): Promise<void> {
  const clean = messages.map((m) => m.trim()).filter(Boolean).slice(0, 30)
  await db.setting.upsert({
    where: { key: TICKER_KEY },
    create: { key: TICKER_KEY, value: { messages: clean } },
    update: { value: { messages: clean } },
  })
}
