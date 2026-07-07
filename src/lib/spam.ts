// Lightweight spam heuristics for the public forms (contact, quote, service).
// Public forms attract two kinds of junk: link/SEO spam (real-looking names,
// promotional text + URLs + "unsubscribe/opt-out" language) and gibberish bot
// fills (random high-consonant tokens). Honeypots miss both when the bot skips
// the hidden field, so we also inspect the content.

const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|net|org|io|co|li|ru|xyz|info|biz|gle|shop|online|site|store|link|click|top|vip)\b)/i

const KEYWORD_RE =
  /\b(unsubscribe|opt[-\s]?out|delist|de-?list|back-?link|guest\s?post|SEO|rank(ing)?\s+(higher|your)|crypto|bitcoin|forex|casino|viagra|cialis|payday|loan offer|click here|buy now|limited time offer|marketing campaign|grow your (business|sales)|dropship)\b/i

/** A single token that looks machine-generated (no spaces, random mixed case,
 *  or very few vowels). Catches names like "bhbsBfYDqXAHsBgM". */
function isGibberishToken(value: string | null | undefined): boolean {
  const t = (value ?? '').trim()
  if (!t || /\s/.test(t) || t.length < 12) return false
  const letters = t.replace(/[^a-z]/gi, '')
  if (letters.length < 10) return false
  const vowels = (t.match(/[aeiou]/gi) || []).length
  const vowelRatio = vowels / letters.length
  // 3+ case switches in a row is a strong random-string signal.
  const manyCaseSwitches = (t.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length >= 4
  return vowelRatio < 0.28 || manyCaseSwitches
}

/** True when a public-form submission is almost certainly spam. */
export function looksLikeSpam(fields: {
  name?: string | null
  company?: string | null
  email?: string | null
  message?: string | null
  instrument?: string | null
}): boolean {
  const blob = [fields.name, fields.company, fields.message, fields.instrument]
    .filter(Boolean)
    .join('  ')
  if (URL_RE.test(blob)) return true
  if (KEYWORD_RE.test(blob)) return true
  if (isGibberishToken(fields.name) || isGibberishToken(fields.company) || isGibberishToken(fields.instrument)) return true
  return false
}
