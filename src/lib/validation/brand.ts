import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().trim().min(2, 'Brand name is required'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
})

export type BrandInput = z.infer<typeof brandSchema>
