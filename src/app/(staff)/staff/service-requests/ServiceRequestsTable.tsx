'use client'

import { useMemo, useState } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import Pager, { pageSlice } from '@/components/ui/Pager'
import StatusForm from './StatusForm'
import DeleteButton from '@/components/DeleteButton'
import DetailModal from '@/components/ui/DetailModal'
import { deleteServiceRequest } from './actions'

export type ServiceRow = {
  id: string
  requestNo: string
  typeLabel: string
  status: string
  who: string
  contact: string | null
  equipment: string | null
  message: string | null
  preferredDate: string | null
  salesPersonId: string | null
  createdAt: string
}

const STATUSES = ['NEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 15

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ServiceRequestsTable({
  rows,
  salesPeople,
  isAdmin,
}: {
  rows: ServiceRow[]
  salesPeople: { id: string; name: string }[]
  isAdmin: boolean
}) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let r = rows
    if (status !== 'ALL') r = r.filter((x) => x.status === status)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((x) => [x.requestNo, x.who, x.contact ?? '', x.equipment ?? ''].join(' ').toLowerCase().includes(s))
    return [...r].sort((a, b) => (sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)))
  }, [rows, q, status, sort])

  const pageRows = pageSlice(filtered, page, PAGE_SIZE)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search no., requester, equipment…" className={`${selectCls} min-w-0 flex-1`} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className={selectCls} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Request</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Requester</th>
              <th className="px-3 py-2 font-medium">Equipment</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Received</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">No service requests match these filters.</td></tr>
            ) : (
              pageRows.map((r) => <Row key={r.id} r={r} salesPeople={salesPeople} isAdmin={isAdmin} />)
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}

function Row({ r, salesPeople, isAdmin }: { r: ServiceRow; salesPeople: { id: string; name: string }[]; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 align-middle">
        <td className="px-3 py-2 font-mono text-slate-900">{r.requestNo}</td>
        <td className="px-3 py-2"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{r.typeLabel}</span></td>
        <td className="px-3 py-2 text-slate-700">{r.who}</td>
        <td className="px-3 py-2 text-slate-600">{r.equipment ?? <span className="text-slate-300"></span>}</td>
        <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">{fmtDate(r.createdAt)}</td>
        <td className="px-3 py-2 text-right">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50" aria-haspopup="dialog">
            Manage
          </button>
        </td>
      </tr>
      <DetailModal
        open={open}
        onClose={() => setOpen(false)}
        header={
          <>
            <span className="font-mono text-sm font-semibold text-slate-900">{r.requestNo}</span>
            <StatusBadge status={r.status} />
            <span className="text-xs text-slate-400">{r.typeLabel} · {fmtDate(r.createdAt)}</span>
          </>
        }
        footer={
          isAdmin ? (
            <DeleteButton
              action={deleteServiceRequest.bind(null, r.id)}
              label="Delete"
              confirmText={`Delete ${r.requestNo}? This cannot be undone.`}
              className="text-xs text-red-600 underline hover:text-red-700"
            />
          ) : undefined
        }
      >
        {/* Requester / equipment / preferred date */}
        <div className="rounded-lg bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Request</div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 px-3 py-2.5 text-sm sm:grid-cols-2">
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Requester</dt><dd className="min-w-0 font-medium text-slate-800">{r.who}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Contact</dt><dd className="min-w-0 truncate text-slate-700">{r.contact || <span className="text-slate-300"></span>}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Equipment</dt><dd className="min-w-0 text-slate-700">{r.equipment || <span className="text-slate-300"></span>}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">Preferred</dt><dd className="min-w-0 text-slate-700">{r.preferredDate || <span className="text-slate-300"></span>}</dd></div>
          </dl>
        </div>

        {r.message ? (
          <div className="rounded-lg bg-white ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Details</div>
            <p className="whitespace-pre-line px-3 py-2.5 text-sm leading-relaxed text-slate-600">{r.message}</p>
          </div>
        ) : null}

        {/* Status + assignment controls */}
        <div className="rounded-lg bg-white px-3 py-3 ring-1 ring-slate-200">
          <StatusForm id={r.id} status={r.status} salesPersonId={r.salesPersonId} salesPeople={salesPeople} />
        </div>
      </DetailModal>
    </>
  )
}
