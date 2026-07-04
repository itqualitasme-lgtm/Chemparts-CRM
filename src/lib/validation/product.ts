import { z } from 'zod'

export const PRODUCT_TYPES = ['EQUIPMENT', 'SPARE_PART', 'CONSUMABLE'] as const

const optionalPrice = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length ? Number(v) : null))
  .refine((v) => v === null || (!Number.isNaN(v) && v >= 0), 'Enter a valid price')

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  slug: z.string().trim().optional().or(z.literal('')),
  brandId: z.string().trim().min(1, 'Select a brand'),
  type: z.enum(PRODUCT_TYPES),
  desc: z.string().trim().min(2, 'Short description is required'),
  overview: z.string().trim().optional().or(z.literal('')),
  standards: z.string().trim().optional().or(z.literal('')), // comma-separated
  industries: z.string().trim().optional().or(z.literal('')), // comma-separated
  modelNo: z.string().trim().optional().or(z.literal('')),
  unit: z.string().trim().optional().or(z.literal('')),
  tags: z.string().trim().optional().or(z.literal('')), // hashtags: "#xrf #petroleum" or "xrf, petroleum"
  listPrice: optionalPrice,
  currency: z.string().trim().min(1).default('AED'),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
})

export type ProductInput = z.infer<typeof productSchema>

/** Split a comma/newline separated list into a trimmed, de-duplicated array. */
export function splitList(value: string | undefined | null): string[] {
  if (!value) return []
  return [...new Set(value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean))]
}

/**
 * Parse a hashtag string into normalized tags. Accepts "#xrf #petroleum",
 * "xrf, petroleum" or newline-separated. Strips leading '#', lowercases,
 * kebab-cases spaces, and de-duplicates. These power search + "recent by tag".
 */
export function splitTags(value: string | undefined | null): string[] {
  if (!value) return []
  return [
    ...new Set(
      value
        .split(/[\s,\n]+/)
        .map((s) => s.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean),
    ),
  ].slice(0, 30)
}
