import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { getBotReply, CHAT_IDLE_CLOSED_MESSAGE } from '@/lib/chat-bot'
import { notifyStaff } from '@/lib/mail/notify'
import { createNotification } from '@/lib/notifications'
import { appUrl } from '@/lib/env'

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/

/** A chat with no activity for this long is closed automatically. */
export const IDLE_CLOSE_MINUTES = 30

/**
 * Lazily close conversations that have gone quiet, so the staff inbox only ever
 * shows chats that are actually alive. Runs on every chat API hit — no cron
 * needed, and it's a single indexed UPDATE (status, lastMessageAt).
 */
async function closeIdleConversations() {
  const cutoff = new Date(Date.now() - IDLE_CLOSE_MINUTES * 60_000)
  const stale = await db.chatConversation.findMany({
    where: { status: { in: ['BOT', 'LIVE'] }, lastMessageAt: { lt: cutoff } },
    select: { id: true },
    take: 200,
  })
  if (stale.length === 0) return
  const ids = stale.map((c) => c.id)
  // Tell the visitor why it ended, then close. lastMessageAt is deliberately
  // NOT bumped, so this notice can't keep the conversation alive.
  await db.chatMessage.createMany({
    data: ids.map((conversationId) => ({ conversationId, sender: 'BOT' as const, body: CHAT_IDLE_CLOSED_MESSAGE })),
  })
  await db.chatConversation.updateMany({
    where: { id: { in: ids } },
    data: { status: 'CLOSED', closedAt: new Date() },
  })
}

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
    select: {
      token: true,
      status: true,
      visitorEmail: true,
      visitorPhone: true,
      messages: { orderBy: { createdAt: 'asc' }, select: { id: true, sender: true, body: true, createdAt: true } },
    },
  })
  if (!conv) return null
  return {
    token: conv.token,
    status: conv.status,
    // Drives the widget's "leave your details" prompt — never expose the values.
    contactCaptured: Boolean(conv.visitorEmail && conv.visitorPhone),
    idleCloseMinutes: IDLE_CLOSE_MINUTES,
    messages: conv.messages.map(shape),
  }
}

/** Visitor sends a message. Creates the conversation on first contact, runs the
 *  bot while it's bot-handled, and hands off to a live agent on request. */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* validated below */ }

  await closeIdleConversations()

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

  // A visitor writing into a closed chat reopens it (back to the bot).
  if (conv.status === 'CLOSED') {
    await db.chatConversation.update({ where: { id: conv.id }, data: { status: 'BOT', agentRequested: false, closedAt: null } })
    conv = { ...conv, status: 'BOT', agentRequested: false }
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
      await createNotification({ kind: 'INFO', title: 'Live chat - agent requested', body: `${who}: ${message.slice(0, 80)}`, link: '/staff/chats', entity: 'ChatConversation', entityId: conv!.id })
    })
  }

  const payload = await conversationPayload(conv.id)
  return NextResponse.json(payload)
}

/**
 * Visitor leaves an email + phone because nobody picked up the live request.
 * Staff get notified so an agent can follow up once they're back.
 */
export async function PUT(req: Request) {
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* validated below */ }

  const token = typeof body.token === 'string' ? body.token : null
  const email = (typeof body.email === 'string' ? body.email : '').trim().slice(0, 160)
  const phone = (typeof body.phone === 'string' ? body.phone : '').trim().slice(0, 40)
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 7) return NextResponse.json({ error: 'Enter a valid contact number.' }, { status: 400 })

  const conv = await db.chatConversation.findUnique({ where: { token }, select: { id: true, visitorName: true } })
  if (!conv) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

  await db.chatConversation.update({
    where: { id: conv.id },
    // Keep it open and flagged for a human — this is a callback request.
    data: { visitorEmail: email, visitorPhone: phone, agentRequested: true, status: 'LIVE', lastMessageAt: new Date() },
  })
  await db.chatMessage.create({
    data: {
      conversationId: conv.id,
      sender: 'BOT',
      body: `Thanks - we have your email (${email}) and number (${phone}). An agent will get back to you as soon as they're available.`,
    },
  })

  const who = conv.visitorName || email
  const link = `${appUrl()}/staff/chats`
  after(async () => {
    await notifyStaff('staff-chat-agent', { who, message: `Callback requested - email: ${email}, phone: ${phone}`, link })
    await createNotification({
      kind: 'INFO',
      title: 'Live chat - callback requested',
      body: `${who} left contact details: ${email} / ${phone}`,
      link: '/staff/chats',
      entity: 'ChatConversation',
      entityId: conv.id,
    })
  })

  const payload = await conversationPayload(conv.id)
  return NextResponse.json(payload)
}

/** Visitor polls for new messages (staff replies) on their conversation. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  await closeIdleConversations()
  const conv = await db.chatConversation.findUnique({ where: { token }, select: { id: true } })
  if (!conv) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const payload = await conversationPayload(conv.id)
  return NextResponse.json(payload)
}
