'use server'

import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePortal, requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { notify } from '@/lib/mail/notify'
import type { ServiceStatus } from '@/generated/prisma/client'

export type ServiceUpdateState = { ok?: boolean; error?: string }

const STATUSES: ServiceStatus[] = ['NEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

/** Staff update a service request's status + assigned sales person. */
export async function updateServiceRequest(id: string, formData: FormData): Promise<ServiceUpdateState> {
  await requirePortal('staff')
  const statusRaw = (formData.get('status') as string | null)?.trim() as ServiceStatus | undefined
  const status = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : undefined
  const salesPersonId = (formData.get('salesPersonId') as string | null)?.trim() || null

  const req = await db.serviceRequest.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      requestNo: true,
      guestName: true,
      guestEmail: true,
      customer: { select: { companyName: true, email: true, contacts: { where: { isPrimary: true }, take: 1, select: { email: true } } } },
    },
  })
  if (!req) return { error: 'Service request not found.' }

  await db.serviceRequest.update({ where: { id }, data: { ...(status ? { status } : {}), salesPersonId } })

  // Tell the requester when the status actually changes.
  if (status && status !== req.status) {
    const to = req.guestEmail ?? req.customer?.email ?? req.customer?.contacts[0]?.email
    after(() =>
      notify(to, 'service-status-update', {
        name: req.guestName ?? req.customer?.companyName ?? 'there',
        requestNo: req.requestNo,
        status: status.replace(/_/g, ' '),
      }),
    )
  }

  revalidatePath('/staff/service-requests')
  return { ok: true }
}

/** Admin-only: delete a service request. */
export async function deleteServiceRequest(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Only administrators can delete service requests.' }
  const req = await db.serviceRequest.findUnique({ where: { id }, select: { id: true } })
  if (!req) return { error: 'Service request not found.' }
  await db.serviceRequest.delete({ where: { id } })
  revalidatePath('/staff/service-requests')
  return {}
}
