'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { updateEnquiryStatus, deleteEnquiry, assignSalesPerson } from './actions'
import CreateQuotationButton from './CreateQuotationButton'
import DeleteButton from '@/components/DeleteButton'
import Pager, { pageSlice } from '@/components/ui/Pager'

export type EnquiryRow = {
  id: string
  enquiryNo: string
  type: string
  status: string
  who: string
  contactName: string | null
  email: string | null
  phone: string | null
  company: string | null
  contactBits: string[]
  salesPerson: string | null
  salesPersonId: string
  message: string | null
  lostReason: string | null
  createdAt: string // ISO
  items: { id: string; productName: string; qty: number; priceRequested: boolean }[]
  quotations: { id: string; quotationNo: string }[]
}

const STATUSES = ['NEW', 'UNDER_REVIEW', 'QUOTED', 'WON', 'LOST'] as const

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  QUOTED: 'bg-indigo-100 text-indigo-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-slate-200 text-slate-600',
}

const TYPE_LABEL: Record<string, string> = {
  WEBSITE: 'Website', PHONE: 'Phone', EMAIL: 'Email', WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in', REFERRAL: 'Referral', EXHIBITION: 'Exhibition', TENDER: 'Tender', OTHER: 'Other',
}

const label = (s: string) => s.replace('_', ' ')

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function EnquiriesTable({ enquiries, isAdmin, salesPeople }: { enquiries: EnquiryRow[]; isAdmin: boolean; salesPeople: { id: string; name: string }[] }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [channel, setChannel] = useState('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15
  useEffect(() => setPage(1), [q, status, channel, sort])

  const channels = useMemo(
    () => Array.from(new Set(enquiries.map((e) => e.type))),
    [enquiries],
  )

  const filtered = useMemo(() => {
    let rows = enquiries
    if (status !== 'ALL') rows = rows.filter((r) => r.status === status)
    if (channel !== 'ALL') rows = rows.filter((r) => r.type === channel)
    const s = q.trim().toLowerCase()
    if (s) {
      rows = rows.filter((r) =>
        [r.enquiryNo, r.who, r.contactName ?? '', ...r.contactBits].join(' ').toLowerCase().includes(s),
      )
    }
    return [...rows].sort((a, b) =>
      sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
    )
  }, [enquiries, q, status, channel, sort])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search no., customer, contact…"
          className={`${selectCls} min-w-0 flex-1`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectCls} aria-label="Filter by channel">
          <option value="ALL">All channels</option>
          {channels.map((c) => <option key={c} value={c}>{TYPE_LABEL[c] ?? c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className={selectCls} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Enquiry</th>
              <th className="px-3 py-2 font-medium">Channel</th>
              <th className="px-3 py-2 font-medium">Customer / contact</th>
              <th className="px-3 py-2 text-center font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Sales</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Received</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                  No enquiries match these filters.
                </td>
              </tr>
            ) : (
              pageSlice(filtered, page, PAGE_SIZE).map((e) => <Row key={e.id} e={e} isAdmin={isAdmin} salesPeople={salesPeople} />)
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}

function Row({ e, isAdmin, salesPeople }: { e: EnquiryRow; isAdmin: boolean; salesPeople: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(e.status)
  const [reason, setReason] = useState(e.lostReason ?? '')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string }>({})
  const [assignee, setAssignee] = useState(e.salesPersonId)
  const [assigning, startAssign] = useTransition()
  const [assignMsg, setAssignMsg] = useState<{ ok?: boolean; error?: string }>({})

  function saveAssignee(next: string) {
    setAssignee(next)
    startAssign(async () => {
      setAssignMsg({})
      const res = await assignSalesPerson(e.id, next)
      setAssignMsg(res)
    })
  }

  const dirty = draft !== e.status || (draft === 'LOST' && reason.trim() !== (e.lostReason ?? ''))
  const canSave = dirty && !(draft === 'LOST' && !reason.trim())

  function save() {
    start(async () => {
      setMsg({})
      const fd = new FormData()
      fd.set('status', draft)
      if (draft === 'LOST') fd.set('lostReason', reason)
      const res = await updateEnquiryStatus(e.id, fd)
      setMsg(res)
    })
  }

  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 align-middle">
        <td className="px-3 py-2 font-mono text-slate-900">{e.enquiryNo}</td>
        <td className="px-3 py-2">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{TYPE_LABEL[e.type] ?? e.type}</span>
        </td>
        <td className="px-3 py-2">
          <div className="font-medium text-slate-800">{e.who}</div>
          {e.contactName && e.contactName !== e.who ? <div className="text-xs text-slate-500">{e.contactName}</div> : null}
          {e.email ? (
            <a href={`mailto:${e.email}`} className="block truncate text-xs text-[#0E7490] hover:underline" title={e.email}>{e.email}</a>
          ) : (
            <div className="text-xs text-slate-300">no email</div>
          )}
        </td>
        <td className="px-3 py-2 text-center text-slate-600">{e.items.length}</td>
        <td className="px-3 py-2 text-slate-600">{e.salesPerson ?? <span className="text-slate-300">—</span>}</td>
        <td className="px-3 py-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[e.status]}`}>{label(e.status)}</span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{fmtDate(e.createdAt)}</td>
        <td className="px-3 py-2 text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            aria-expanded={open}
          >
            {open ? 'Close' : 'Manage'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-slate-100 bg-slate-50/60">
          <td colSpan={8} className="px-3 py-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                {/* Status editor */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Status</span>
                  <select value={draft} onChange={(ev) => setDraft(ev.target.value)} className={selectCls}>
                    {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                  {draft === 'LOST' && (
                    <input
                      value={reason}
                      onChange={(ev) => setReason(ev.target.value)}
                      placeholder="Reason lost (e.g. price, competitor, no budget)"
                      className={`${selectCls} min-w-[16rem] flex-1`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending || !canSave}
                    className="rounded-lg bg-[#0A2540] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-40"
                  >
                    {pending ? 'Saving…' : 'Save'}
                  </button>
                  {msg.ok ? <span className="text-xs text-green-700">Saved</span> : null}
                  {msg.error ? <span className="text-xs text-red-600">{msg.error}</span> : null}
                </div>

                {/* Sales-person assignment (emails the assignee) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Sales person</span>
                  <select
                    value={assignee}
                    onChange={(ev) => saveAssignee(ev.target.value)}
                    disabled={assigning}
                    className={selectCls}
                    aria-label="Assign sales person"
                  >
                    <option value="">— Unassigned —</option>
                    {salesPeople.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                  </select>
                  {assigning ? <span className="text-xs text-slate-400">Saving…</span> : null}
                  {assignMsg.ok ? <span className="text-xs text-green-700">Assigned — emailed</span> : null}
                  {assignMsg.error ? <span className="text-xs text-red-600">{assignMsg.error}</span> : null}
                </div>

                {/* Contact details — so staff can reach the enquirer directly */}
                {(e.email || e.phone || e.company) ? (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                    {e.email ? (
                      <span><span className="text-slate-400">Email:</span> <a href={`mailto:${e.email}?subject=Re: ${e.enquiryNo}`} className="font-medium text-[#0E7490] hover:underline">{e.email}</a></span>
                    ) : null}
                    {e.phone ? (
                      <span><span className="text-slate-400">Phone:</span> <a href={`tel:${e.phone}`} className="font-medium text-[#0E7490] hover:underline">{e.phone}</a></span>
                    ) : null}
                    {e.company ? <span><span className="text-slate-400">Company:</span> <span className="text-slate-700">{e.company}</span></span> : null}
                  </div>
                ) : null}

                {e.status === 'LOST' && e.lostReason ? (
                  <p className="text-sm text-slate-600"><span className="text-slate-400">Lost reason:</span> {e.lostReason}</p>
                ) : null}

                {e.message ? (
                  <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
                    <span className="text-slate-400">Message:</span> {e.message}
                  </p>
                ) : null}

                {/* Items */}
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-500">Line items</div>
                  <ul className="divide-y divide-slate-100 rounded-lg bg-white ring-1 ring-slate-200">
                    {e.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span className="text-slate-800">{it.productName}</span>
                        <span className="flex items-center gap-2">
                          {it.priceRequested ? <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">price to confirm</span> : null}
                          <span className="font-mono text-slate-500">× {it.qty}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row flex-wrap items-start gap-2 md:flex-col md:items-end">
                {e.quotations.length > 0 ? (
                  <div className="flex flex-col items-start gap-1 md:items-end">
                    {e.quotations.map((qt) => (
                      <Link
                        key={qt.id}
                        href={`/staff/quotations/${qt.id}`}
                        className="rounded-lg border border-[#0A2540] px-3 py-1.5 font-mono text-xs font-medium text-[#0A2540] transition hover:bg-[#0A2540] hover:text-white"
                      >
                        View {qt.quotationNo} →
                      </Link>
                    ))}
                    <span className="text-[11px] text-slate-400">Already quoted</span>
                  </div>
                ) : (
                  <CreateQuotationButton enquiryId={e.id} />
                )}
                {isAdmin && (
                  <DeleteButton
                    action={deleteEnquiry.bind(null, e.id)}
                    label="Delete"
                    confirmText={`Delete ${e.enquiryNo}? This cannot be undone.`}
                    className="text-xs text-red-600 underline hover:text-red-700"
                  />
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
