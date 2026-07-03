// Product images come from two sources:
//  - imported website catalog: bare filenames served from /public/images/products
//  - staff uploads: full Supabase Storage public URLs
// This resolves either to a usable <img src>.

export function productImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image
  return `/images/products/${image}`
}
