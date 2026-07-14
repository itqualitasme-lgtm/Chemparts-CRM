import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import StaffChats, { type ChatRow } from './StaffChats'

export const metadata = { title: 'Chats - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StaffChatsPage() {
  await requirePortal('staff')

  const convs = await db.chatConversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
    select: {
      id: true,
      token: true,
      visitorName: true,
      visitorEmail: true,
      status: true,
      agentRequested: true,
      lastMessageAt: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true } },
      _count: { select: { messages: true } },
    },
  })

  const rows: ChatRow[] = convs.map((c) => ({
    token: c.token,
    who: c.visitorName || c.visitorEmail || 'Website visitor',
    email: c.visitorEmail,
    status: c.status,
    agentRequested: c.agentRequested,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastPreview: c.messages[0]?.body ?? '',
    count: c._count.messages,
  }))

  const waiting = rows.filter((r) => r.status === 'LIVE').length

  return (
    <div>
      <PageHeader title="Chats" subtitle={`${rows.length} conversations${waiting ? ` · ${waiting} awaiting a reply` : ''}.`} />
      <StaffChats rows={rows} />
    </div>
  )
}
