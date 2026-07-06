import 'server-only'
import { db } from '@/lib/db'

export type NotificationRow = {
  id: string
  kind: string
  title: string
  body: string | null
  link: string | null
  readAt: Date | null
  readByName: string | null
  createdAt: Date
}

/** Recent notifications for the staff bell (newest first). */
export async function getNotifications(limit = 20): Promise<NotificationRow[]> {
  return db.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, kind: true, title: true, body: true, link: true, readAt: true, readByName: true, createdAt: true },
  })
}

export async function getUnreadCount(): Promise<number> {
  return db.notification.count({ where: { readAt: null } })
}

/** Create an in-app notification. Best-effort — never throws. */
export async function createNotification(input: {
  kind?: string
  title: string
  body?: string | null
  link?: string | null
  entity?: string | null
  entityId?: string | null
}): Promise<void> {
  try {
    await db.notification.create({
      data: {
        kind: input.kind ?? 'INFO',
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
      },
    })
  } catch {
    // swallow — a notification must never break the action that triggered it.
  }
}
