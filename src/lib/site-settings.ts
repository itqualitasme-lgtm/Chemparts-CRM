import 'server-only'
import { db } from '@/lib/db'

// Staff-editable site settings stored in the Setting table (key -> JSON value).

/** Default header ticker messages. "{count}" -> live instrument count and
 *  "{brands}" -> live brand count, replaced at render time. */
export const DEFAULT_TICKER: string[] = [
  'AUTHORIZED PARTNER · Hitachi · Tanaka · Oxford Instruments · KEM',
  'WORLDWIDE SHIPPING · export-packed · insured · fully documented',
  '{count} ANALYTICAL INSTRUMENTS · {brands} brand partners · in stock',
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

// ---------------------------------------------------------------------------
// FAQ — staff-editable question/answer list shown on the public /faq page.
// ---------------------------------------------------------------------------

export type Faq = { q: string; a: string }

export const DEFAULT_FAQS: Faq[] = [
  { q: 'Do you supply analytical instruments across the whole Gulf?', a: 'Yes. Chemparts supplies, installs and services analytical instruments, OEM spare parts and lab consumables across the UAE, Qatar and the wider Gulf, with offices in the UAE and Qatar and same working-day response.' },
  { q: 'Are you an authorized distributor?', a: 'Yes — we are an authorized regional partner for the brands we carry (Hitachi, Tanaka, Oxford Instruments, KEM and more). Every instrument ships with full manufacturer warranty, not as a parallel import.' },
  { q: 'Do you show prices, or is everything by quote?', a: 'Instruments are quoted to your exact configuration and standard. Many spares and consumables carry a listed price and can be added to a cart; for everything else, request a price or a quote and our team replies — usually within the working day.' },
  { q: 'Which standards do you support?', a: 'Every quote references the ASTM, ISO or IP method you need to comply with — flash point, distillation, sulphur, XRF, viscosity, RoHS and more.' },
  { q: 'Do you provide installation, calibration and service?', a: 'Yes. Factory-certified engineers handle installation, commissioning, preventive maintenance, calibration and AMC contracts, with IQ/OQ/PQ documentation matched to your audit requirements.' },
  { q: 'Can you handle turnkey lab fit-outs?', a: 'Yes — from design and instrument selection to install, commissioning, training and ongoing support, for university, refinery, environmental and industrial labs.' },
  { q: 'How do I get a quote?', a: 'Use the “Get a quote” button, the contact form, or WhatsApp us. Tell us the standard, sample type or model and we’ll come back with options and pricing.' },
]

const FAQ_KEY = 'site.faqs'

export async function getFaqs(): Promise<Faq[]> {
  const row = await db.setting.findUnique({ where: { key: FAQ_KEY } })
  const v = row?.value as { items?: unknown } | null
  const items = v?.items
  if (Array.isArray(items)) {
    const clean = items
      .filter((it): it is Faq => !!it && typeof (it as Faq).q === 'string' && typeof (it as Faq).a === 'string')
      .map((it) => ({ q: it.q.trim(), a: it.a.trim() }))
      .filter((it) => it.q && it.a)
    if (clean.length) return clean
  }
  return DEFAULT_FAQS
}

export async function saveFaqs(items: Faq[]): Promise<void> {
  const clean = items.map((it) => ({ q: (it.q ?? '').trim(), a: (it.a ?? '').trim() })).filter((it) => it.q && it.a).slice(0, 40)
  await db.setting.upsert({
    where: { key: FAQ_KEY },
    create: { key: FAQ_KEY, value: { items: clean } },
    update: { value: { items: clean } },
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
