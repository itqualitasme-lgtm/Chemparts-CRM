// Image URL helpers shared by the public site.
//
//  - absImg(): turn a stored image value into a correct absolute <img src>.
//    The imported catalog stores BARE filenames (e.g. "X-Supreme-8000.png")
//    served from /assets/images/products; staff uploads store full Supabase
//    Storage URLs; some values are already rooted paths.
//  - optimizedImg(): route through Next's image optimizer for resized, WebP/AVIF,
//    CDN-cached delivery (big speed win). Width MUST be one of the configured
//    device/image sizes (see next.config.ts).

export function absImg(src: string | null | undefined): string | null {
  if (!src) return null
  const s = String(src).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return s
  if (s.startsWith('assets/') || s.startsWith('images/')) return '/' + s
  return '/assets/images/products/' + s
}

export function optimizedImg(src: string | null | undefined, width: number, quality = 72): string | null {
  const abs = absImg(src)
  if (!abs) return null
  return `/_next/image?url=${encodeURIComponent(abs)}&w=${width}&q=${quality}`
}
