'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { EnquiryStatus } from '@/generated/prisma/client'

export type UpdateStatusState = { ok?: boolean; error?: string }

const VALID: EnquiryStatus[] = ['NEW', 'UNDER_REVIEW', 'QUOTED', 'WON', 'LOST']

/** Staff move an enquiry through its lifecycle (NEW → UNDER_REVIEW → QUOTED → WON/LOST). */
export async function updateEnquiryStatus(
  enquiryId: string,
  formData: FormData,
): Promise<UpdateStatusState> {
  await requirePortal('staff')

  const status = (formData.get('status') as string | null)?.trim() as EnquiryStatus | undefined
  if (!status || !VALID.includes(status)) {
    return { error: 'Invalid status.' }
  }

  const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true } })
  if (!enquiry) return { error: 'Enquiry not found.' }

  await db.enquiry.update({ where: { id: enquiryId }, data: { status } })

  revalidatePath('/staff/enquiries')
  return { ok: true }
}
