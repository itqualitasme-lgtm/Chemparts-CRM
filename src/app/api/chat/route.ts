import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { getBotReply } from '@/lib/chat-bot'
import { notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import { appUrl } from '@/lib/env'

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/

type MsgOut = { id: string; sender: string; body: string; createdAt: string }
const shape = (m: { id: string; sender: string; body: string; createdAt: Date }): MsgOut => ({
  id: m.id,
  sender: m.sender,
  body: m.body,
  createdAt: m.createdAt.toISOString(),
})

async function conversationPayload(id: string) {
  const conv = await db.chatConversation.findUnique({
    where: { id },
    select: { token: true, status: true, messages: { orderBy: { createdAt: 'asc' }, select: { id: true, sender: true, body: true, createdAt: true } } },
  })
  if (!conv) return null
  return { token: conv.token, status: conv.status, messages: conv.messages.map(shape) }
}

/** Visitor sends a message. Creates the conversation on first contact, runs the
 *  bot while it's bot-handled, and hands off to a live agent on request. */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* validated below */ }

  const token = typeof body.token === 'string' ? body.token : null
  const message = (typeof body.message === 'string' ? body.message : '').trim().slice(0, 2000)
  const wantsAgent = body.requestAgent === true
  const nameIn = (typeof body.name === 'string' ? body.name : '').trim().slice(0, 120) || null
  const emailIn = (typeof body.email === 'string' ? body.email : '').trim().slice(0, 160) || null
  if (!message) return NextResponse.json({ error: 'Empty message.' }, { status: 400 })

  // Find the existing conversation (by token) or start a new one.
  let conv = token
    ? await db.chatConversation.findUnique({ where: { token }, select: { id: true, status: true, agentRequested: true, visitorEmail: true, visitorName: true } })
    : null
  if (!conv) {
    const created = await db.chatConversation.create({
      data: { visitorName: nameIn, visitorEmail: emailIn },
      select: { id: true, status: true, agentRequested: true, visitorEmail: true, visitorName: true },
    })
    conv = created
  }

  // Capture the visitor's email/name if we learn it.
  const emailFromMsg = message.match(EMAIL_RE)?.[0] ?? null
  const email = conv.visitorEmail ?? emailIn ?? emailFromMsg
  const name = conv.visitorName ?? nameIn
  if ((email && email !== conv.visitorEmail) || (name && name !== conv.visitorName)) {
    await db.chatConversation.update({ where: { id: conv.id }, data: { visitorEmail: email, visitorName: name } })
  }

  await db.chatMessage.create({ data: { conversationId: conv.id, sender: 'VISITOR', body: message } })

  // Decide the bot reply / agent handoff.
  let requestAgent = wantsAgent
  if (conv.status === 'BOT') {
    const bot = getBotReply(message)
    requestAgent = requestAgent || bot.requestAgent
    await db.chatMessage.create({ data: { conversationId: conv.id, sender: 'BOT', body: bot.reply } })
  }

  const nowLive = requestAgent && !conv.agentRequested
  await db.chatConversation.update({
    where: { id: conv.id },
    data: {
      lastMessageAt: new Date(),
      ...(requestAgent ? { agentRequested: true, status: 'LIVE' } : {}),
    },
  })

  // Notify staff once, when a human is first requested.
  if (nowLive) {
    const who = name || email || 'A website visitor'
    const link = `${appUrl()}/staff/chats`
    after(async () => {
      await notifyStaff('staff-chat-agent', { who, message, link })
      await createNotification({ kind: 'INFO', title: 'Live chat — agent requested', body: `${who}: ${message.slice(0, 80)}`, link: '/staff/chats', entity: 'ChatConversation', entityId: conv!.id })
    })
  }

  const payload = await conversationPayload(conv.id)
  return NextResponse.json(payload)
}

/** Visitor polls for new messages (staff replies) on their conversation. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  const conv = await db.chatConversation.findUnique({ where: { token }, select: { id: true } })
  if (!conv) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const payload = await conversationPayload(conv.id)
  return NextResponse.json(payload)
}
