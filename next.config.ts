import type { NextConfig } from 'next'

const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.Chemparts_SUPABASE_URL
    return url ? new URL(url).host : undefined
  } catch {
    return undefined
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 60, 72, 75, 80],
    // Product/brand images are immutable (unique upload paths), so let Vercel
    // hold each optimized variant for 30 days. This is the main Supabase egress
    // lever: the optimizer then re-fetches an original from Storage at most once
    // a month per size, instead of on every cache miss.
    minimumCacheTTL: 2_592_000,
  },
  // Product/brand/customer uploads are cropped + compressed client-side before
  // they reach the server action, but raise the default 1MB cap as a safety net
  // for the odd large PDF (customer documents) or uncompressed source.
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
}

export default nextConfig
