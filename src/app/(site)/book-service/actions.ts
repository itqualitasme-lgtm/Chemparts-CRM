'use server'

import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { nextServiceNo, SERVICE_TYPE_LABEL } from '@/lib/service'
import { appUrl } from '@/lib/env'
import { notify, notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import type { ServiceType } from '@/generated/prisma/client'

export type BookServiceState = { ok?: boolean; error?: string; requestNo?: string }

const TYPES: ServiceType[] = ['AMC', 'CALIBRATION', 'REPAIR', 'INSTALLATION', 'CONSULTATION', 'OTHER']

export async function bookService(_prev: BookServiceState, formData: FormData): Promise<BookServiceState> {
  const typeRaw = (formData.get('type') as string | null)?.trim() as ServiceType | undefined
  const type: ServiceType = typeRaw && TYPES.includes(typeRaw) ? typeRaw : 'AMC'
  const equipment = (formData.get('equipment') as string | null)?.trim() || null
  const message = (formData.get('message') as string | null)?.trim() || null
  const preferredRaw = (formData.get('preferredDate') as string | null)?.trim()
  const preferredDate = preferredRaw ? new Date(preferredRaw) : null

  const user = await getSessionUser()

  let guestName: string | null = null
  let guestEmail: string | null = null
  let guestCompany: string | null = null
  let guestPhone: string | null = null

  if (!user) {
    guestName = (formData.get('name') as string | null)?.trim() || null
    guestEmail = (formData.get('email') as string | null)?.trim() || null
    guestCompany = (formData.get('company') as string | null)?.trim() || null
    guestPhone = (formData.get('phone') as string | null)?.trim() || null
    if (!guestName || !guestEmail) return { error: 'Please enter your name and email so we can reply.' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) return { error: 'Please enter a valid email address.' }
  }

  const requestNo = await nextServiceNo()
  await db.serviceRequest.create({
    data: {
      requestNo,
      type,
      customerId: user?.customerId ?? null,
      createdByProfile: user?.id ?? null,
      guestName,
      guestEmail,
      guestCompany,
      guestPhone,
      equipment,
      message,
      preferredDate: preferredDate && !Number.isNaN(preferredDate.getTime()) ? preferredDate : null,
      status: 'NEW',
    },
  })

  // Confirm to the requester + notify staff, after the response (non-blocking).
  const to = user?.email ?? guestEmail
  after(async () => {
    await notify(to, 'service-received', { name: user?.fullName || guestName || 'there', requestNo })
    await notifyStaff('staff-new-service', {
      requestNo,
      type: SERVICE_TYPE_LABEL[type] ?? type,
      who: guestCompany || guestName || user?.fullName || 'Guest',
      equipment: equipment ?? '',
      link: `${appUrl()}/staff/service-requests`,
    })
    await createNotification({ kind: 'SERVICE', title: `New service request ${requestNo}`, body: `${guestCompany || guestName || user?.fullName || 'Guest'} · ${SERVICE_TYPE_LABEL[type] ?? type}`, link: '/staff/service-requests', entity: 'ServiceRequest' })
  })

  return { ok: true, requestNo }
}
