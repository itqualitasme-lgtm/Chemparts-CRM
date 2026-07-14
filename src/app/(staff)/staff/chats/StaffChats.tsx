'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { replyToChat, closeChat } from './actions'

export type ChatRow = {
  token: string
  who: string
  email: string | null
  status: string
  agentRequested: boolean
  lastMessageAt: string
  lastPreview: string
  count: number
}

type Msg = { id: string; sender: string; body: string; createdAt: string }

const STATUS_BADGE: Record<string, string> = {
  BOT: 'bg-slate-100 text-slate-600',
  LIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-slate-200 text-slate-500',
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function StaffChats({ rows }: { rows: ChatRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<ChatRow | null>(rows[0] ?? null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [status, setStatus] = useState<string>(selected?.status ?? 'BOT')
  const [reply, setReply] = useState('')
  const [pending, start] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the selected row in sync when the server list refreshes.
  useEffect(() => {
    if (selected) {
      const still = rows.find((r) => r.token === selected.token)
      if (still && still !== selected) setSelected(still)
    } else if (rows[0]) {
      setSelected(rows[0])
    }
  }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll the open conversation for new visitor messages.
  useEffect(() => {
    if (!selected) return
    let alive = true
    const load = async () => {
      try {
        const r = await fetch(`/api/chat?token=${encodeURIComponent(selected.token)}`)
        if (!r.ok) return
        const data = await r.json()
        if (alive && Array.isArray(data.messages)) { setMsgs(data.messages); setStatus(data.status) }
      } catch { /* ignore */ }
    }
    load()
    const iv = setInterval(load, 4000)
    return () => { alive = false; clearInterval(iv) }
  }, [selected])

  // Refresh the conversation list periodically so new chats surface.
  useEffect(() => {
    const iv = setInterval(() => router.refresh(), 8000)
    return () => clearInterval(iv)
  }, [router])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [msgs])

  function send() {
    if (!selected || !reply.trim()) return
    const body = reply
    setReply('')
    setMsgs((m) => [...m, { id: `tmp-${Date.now()}`, sender: 'STAFF', body, createdAt: new Date().toISOString() }])
    start(async () => {
      await replyToChat(selected.token, body)
      const r = await fetch(`/api/chat?token=${encodeURIComponent(selected.token)}`)
      if (r.ok) { const d = await r.json(); if (Array.isArray(d.messages)) setMsgs(d.messages) }
    })
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
        No website chats yet. When a visitor uses the chat widget, their conversation appears here.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
          {rows.map((c) => {
            const active = selected?.token === c.token
            return (
              <li key={c.token}>
                <button
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition ${active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-800">{c.who}</span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[c.status] ?? STATUS_BADGE.BOT}`}>{c.status}</span>
                  </div>
                  <div className="truncate text-xs text-slate-500">{c.lastPreview || '—'}</div>
                  <div className="text-[10px] text-slate-400">{timeAgo(c.lastMessageAt)} · {c.count} msg{c.count === 1 ? '' : 's'}</div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Thread */}
      {selected ? (
        <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{selected.who}</div>
              {selected.email ? <a href={`mailto:${selected.email}`} className="text-xs text-[#0E7490] hover:underline">{selected.email}</a> : <span className="text-xs text-slate-400">no email shared</span>}
            </div>
            {status !== 'CLOSED' && (
              <button type="button" onClick={() => start(async () => { await closeChat(selected.token); router.refresh() })} className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Close chat
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-slate-50 p-4">
            {msgs.map((m) => {
              const staff = m.sender === 'STAFF'
              return (
                <div key={m.id} className={`max-w-[80%] ${staff ? 'self-end' : 'self-start'}`}>
                  {!staff && <div className="mb-0.5 ml-1 text-[10px] uppercase tracking-wide text-slate-400">{m.sender === 'BOT' ? 'Assistant' : 'Visitor'}</div>}
                  <div className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${staff ? 'rounded-br-sm bg-[#0A2540] text-white' : m.sender === 'BOT' ? 'rounded-bl-sm bg-white text-slate-500 ring-1 ring-slate-200' : 'rounded-bl-sm bg-white text-slate-800 ring-1 ring-slate-200'}`}>{m.body}</div>
                </div>
              )
            })}
          </div>

          {status === 'CLOSED' ? (
            <div className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-400">This chat is closed.</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2 border-t border-slate-200 p-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply to the visitor…"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20"
              />
              <button type="submit" disabled={pending || !reply.trim()} className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-50">
                Send
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  )
}
