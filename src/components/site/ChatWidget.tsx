'use client'

import { useEffect, useRef, useState } from 'react'
import { BOT_GREETING } from '@/lib/chat-bot'

type Msg = { id: string; sender: string; body: string; createdAt: string }
const TOKEN_KEY = 'cp_chat_token'
const NAVY = '#0A2540'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('BOT')
  const [token, setToken] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Restore an existing conversation on mount.
  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
    if (t) setToken(t)
  }, [])

  // Poll for staff replies while the panel is open.
  useEffect(() => {
    if (!open || !token) return
    let alive = true
    const load = async () => {
      try {
        const r = await fetch(`/api/chat?token=${encodeURIComponent(token)}`)
        if (!r.ok) return
        const data = await r.json()
        if (alive && Array.isArray(data.messages)) { setMsgs(data.messages); setStatus(data.status) }
      } catch { /* ignore */ }
    }
    load()
    const iv = setInterval(load, 4000)
    return () => { alive = false; clearInterval(iv) }
  }, [open, token])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, open])

  async function send(text: string, requestAgent = false) {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setInput('')
    // Optimistic visitor bubble.
    setMsgs((m) => [...m, { id: `tmp-${Date.now()}`, sender: 'VISITOR', body, createdAt: new Date().toISOString() }])
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, message: body, requestAgent }),
      })
      const data = await r.json()
      if (data.token) { setToken(data.token); window.localStorage.setItem(TOKEN_KEY, data.token) }
      if (Array.isArray(data.messages)) setMsgs(data.messages)
      if (data.status) setStatus(data.status)
    } catch {
      setMsgs((m) => [...m, { id: `err-${Date.now()}`, sender: 'BOT', body: 'Sorry — something went wrong. Please try again or email info@chemparts-me.com.', createdAt: new Date().toISOString() }])
    } finally {
      setSending(false)
    }
  }

  const shown: Msg[] = msgs.length ? msgs : [{ id: 'greet', sender: 'BOT', body: BOT_GREETING, createdAt: '' }]

  // If an agent was requested but nobody has replied within 2 minutes, nudge
  // the visitor to call. Re-evaluated on every 4s poll while the panel is open.
  const last = msgs[msgs.length - 1]
  const staffReplied = msgs.some((m) => m.sender === 'STAFF')
  const waitingBusy =
    status === 'LIVE' && !staffReplied && !!last && Date.now() - new Date(last.createdAt).getTime() > 120000

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: NAVY, color: '#fff', boxShadow: '0 8px 24px rgba(10,37,64,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H9l-4 3v-3H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 9.5h8M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chemparts chat"
          style={{
            position: 'fixed', right: 20, bottom: 88, zIndex: 1000,
            width: 'min(370px, calc(100vw - 40px))', height: 'min(540px, calc(100vh - 130px))',
            display: 'flex', flexDirection: 'column',
            background: '#fff', borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(10,37,64,0.28)', border: '1px solid #e2e8f0',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          <div style={{ background: NAVY, color: '#fff', padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Chemparts Chat</div>
            <div style={{ fontSize: 12, color: '#9fb3c8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'LIVE' ? '#22c55e' : '#22D3EE' }} />
              {status === 'LIVE' ? 'Connected to the team' : 'Assistant · usually replies within the working day'}
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shown.map((m) => {
              const mine = m.sender === 'VISITOR'
              return (
                <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                  {!mine && <div style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 2px 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.sender === 'STAFF' ? 'Agent' : 'Assistant'}</div>}
                  <div style={{
                    padding: '9px 12px', borderRadius: 12, fontSize: 14, lineHeight: 1.45, whiteSpace: 'pre-wrap',
                    background: mine ? NAVY : '#fff', color: mine ? '#fff' : '#1a2733',
                    border: mine ? 'none' : '1px solid #e2e8f0',
                    borderBottomRightRadius: mine ? 3 : 12, borderBottomLeftRadius: mine ? 12 : 3,
                  }}>{m.body}</div>
                </div>
              )
            })}
          </div>

          {waitingBusy && (
            <div style={{ margin: '0 14px 8px', padding: '10px 12px', borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', fontSize: 13, lineHeight: 1.45, color: '#9a3412' }}>
              Our team is currently busy. For a faster response, please call{' '}
              <a href="tel:+97165574047" style={{ color: '#0E7490', fontWeight: 600 }}>+971 6 557 4047</a>
              {' '}or{' '}
              <a href="https://wa.me/971557566123" target="_blank" rel="noopener" style={{ color: '#0E7490', fontWeight: 600 }}>WhatsApp us</a>.
            </div>
          )}

          {status !== 'LIVE' && (
            <button
              type="button"
              onClick={() => send('I would like to talk to an agent, please.', true)}
              disabled={sending}
              style={{ margin: '0 14px', padding: '7px', fontSize: 12, fontWeight: 600, color: '#0E7490', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              Talk to a real person →
            </button>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #e2e8f0', background: '#fff' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              aria-label="Your message"
              style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, color: '#1a2733' }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: sending || !input.trim() ? 0.5 : 1 }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
