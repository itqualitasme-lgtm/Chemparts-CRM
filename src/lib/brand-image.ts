// Brand logos come from two sources:
//  - imported website assets: absolute paths like /images/brands/hitachi.jpg
//  - staff uploads: full Supabase Storage public URLs
// This resolves either to a usable <img src>, or null when there is no logo.

export function brandLogoUrl(logo: string | null | undefined): string | null {
  if (!logo) return null
  if (/^https?:\/\//i.test(logo)) return logo
  if (logo.startsWith('/')) return logo
  return `/images/brands/${logo}`
}
