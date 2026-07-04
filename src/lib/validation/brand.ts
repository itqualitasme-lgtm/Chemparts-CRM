import { z } from 'zod'

// Optional-string helper: treats '' as undefined so blank form fields clear.
const optionalStr = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

export const brandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name is required').max(120),
  website: z
    .string()
    .trim()
    .max(300)
    .url('Enter a valid URL (including https://)')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  email: z
    .string()
    .trim()
    .max(200)
    .email('Enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  countryOfOrigin: optionalStr(80),
  focus: optionalStr(200),
  partnerSince: optionalStr(20),
  description: optionalStr(2000),
  featured: z
    .union([z.literal('on'), z.literal('true'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
  sortOrder: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.trunc(n) : 0
    }),
})

export type BrandInput = z.infer<typeof brandSchema>
