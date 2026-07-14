'use server'

import { revalidatePath } from 'next/cache'
import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'

export type ChatState = { ok?: boolean; error?: string }

/** Staff post a reply into a website chat (becomes a LIVE, human-handled thread). */
export async function replyToChat(token: string, body: string): Promise<ChatState> {
  await requirePortal('staff')
  const text = (body ?? '').trim().slice(0, 2000)
  if (!text) return { error: 'Empty message.' }
  const conv = await db.chatConversation.findUnique({ where: { token }, select: { id: true } })
  if (!conv) return { error: 'Conversation not found.' }
  await db.chatMessage.create({ data: { conversationId: conv.id, sender: 'STAFF', body: text } })
  await db.chatConversation.update({
    where: { id: conv.id },
    data: { status: 'LIVE', agentRequested: true, lastMessageAt: new Date() },
  })
  revalidatePath('/staff/chats')
  return { ok: true }
}

/** Staff close a chat once it's resolved. */
export async function closeChat(token: string): Promise<ChatState> {
  await requirePortal('staff')
  const conv = await db.chatConversation.findUnique({ where: { token }, select: { id: true } })
  if (!conv) return { error: 'Conversation not found.' }
  await db.chatConversation.update({ where: { id: conv.id }, data: { status: 'CLOSED' } })
  revalidatePath('/staff/chats')
  return { ok: true }
}
