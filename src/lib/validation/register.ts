import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name'),
  companyName: z.string().trim().min(2, 'Enter your company name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Include country code, e.g. +971...'),
  country: z.string().length(2, 'Select your country'),
  password: z.string().min(10, 'At least 10 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
